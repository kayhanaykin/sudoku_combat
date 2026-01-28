import requests
from django.conf import settings
from django.shortcuts import redirect, render
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import CustomUserCreationForm, UserProfileForm
from .models import CustomUser, Relationship


# --- HELPER FOR UNLIMITED LOGIN ---

def set_jwt_cookie_and_redirect(user, target_url=None):
    """
    Centralized logic to issue tokens and redirect.
    If target_url is provided, it uses that. 
    Otherwise, it falls back to checking is_profile_complete.
    """
    refresh = RefreshToken.for_user(user)
    
    # 1. Decide the destination
    if target_url:
        target = target_url
    else:
        # Fallback logic for general logins
        target = 'dashboard' if user.is_profile_complete else 'profile_setup'
    
    response = redirect(target)
    
    # 2. Set the Refresh Token in a long-lived, secure cookie
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,   
        secure=True,     # Since you are using HTTPS on 8443
        samesite='Lax',
        max_age=31536000 
    )
    
    return response

# --- AUTHENTICATION VIEWS ---

class FortyTwoLoginView(APIView):
    """Redirects the user to the 42 Authorization page."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        url = (
            f"https://api.intra.42.fr/oauth/authorize"
            f"?client_id={settings.FT_CLIENT_ID}"
            f"&redirect_uri={settings.FT_REDIRECT_URI}"
            f"&response_type=code"
        )
        return redirect(url)

class FortyTwoCallbackView(APIView):
    """Handles return from 42, fetches user data, and logs them in."""
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=400)

        # 1. Exchange code for Access Token
        token_response = requests.post("https://api.intra.42.fr/oauth/token", data={
            "grant_type": "authorization_code",
            "client_id": settings.FT_CLIENT_ID,
            "client_secret": settings.FT_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.FT_REDIRECT_URI,
        })
        
        if token_response.status_code != 200:
            return Response({"error": "Failed to get token"}, status=400)
            
        access_token = token_response.json().get("access_token")

        # 2. Get User Info
        user_info_res = requests.get("https://api.intra.42.fr/v2/me", headers={
            "Authorization": f"Bearer {access_token}"
        })
        user_info = user_info_res.json()

        # 3. Create or Get User
        # defaults are only applied if the user is being created for the first time
        user, created = CustomUser.objects.get_or_create(
            intra_id=user_info.get('id'),
            defaults={
                'username': f"42_{user_info.get('login')}",
                'email': user_info.get('email'),
                'is_active': True,
                'is_profile_complete': False, # New 42 users must fill out setup
            }
        )

        # Log into Django session
        login(request, user)
        
        # 4. Smart Redirection Logic
        # A: User is new -> Go to Setup
        # B: User existed but never finished setup -> Go to Setup
        # C: User is returning and finished setup -> Go to Dashboard
        
        target = 'dashboard'
        if created or not user.is_profile_complete:
            target = 'profile_setup'

        # Use your existing JWT helper with the dynamic target_url
        return set_jwt_cookie_and_redirect(user, target_url=target)

def local_signup_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST) # Or your CustomUserCreationForm
        if form.is_valid():
            user = form.save()
            
            # --- The Key Logic ---
            # We set the display_name to the username and mark as complete
            user.display_name = user.username 
            user.is_profile_complete = True   
            user.save()
            
            login(request, user)
            
            # Now dashboard_view will see is_profile_complete=True and let them in
            return redirect('dashboard') 
    else:
        form = UserCreationForm()
    return render(request, 'user_app/signup.html', {'form': form})

# --- PAGE VIEWS ---

def landing_page(request):
    return render(request, 'user_app/landing.html')

def profile_setup_view(request):
    if not request.user.is_authenticated:
        return redirect('landing')
    
    if request.method == 'POST':
        request.user.display_name = request.POST.get('display_name')
        if request.FILES.get('avatar'):
            request.user.avatar_file = request.FILES.get('avatar')
        request.user.is_profile_complete = True
        request.user.save()
        return redirect('dashboard')
        
    return render(request, 'user_app/setup.html')

@login_required
def dashboard_view(request):
    # --- FRIEND REQUEST LOGIC ---
    if request.method == "POST" and "target_username" in request.POST:
        target_name = request.POST.get("target_username")
        try:
            target_user = CustomUser.objects.get(username=target_name)
            if target_user == request.user:
                messages.error(request, "You cannot add yourself.")
            else:
                Relationship.objects.get_or_create(from_user=request.user, to_user=target_user)
                messages.success(request, f"Request sent to {target_name}!")
        except CustomUser.DoesNotExist:
            messages.error(request, "User not found.")

    if request.method == "POST" and "approve_id" in request.POST:
        rel = Relationship.objects.get(id=request.POST.get("approve_id"), to_user=request.user)
        rel.status = 'friends'
        rel.save()

    # --- DATA FETCHING ---
    pending_requests = Relationship.objects.filter(to_user=request.user, status='pending')
    
    # Get all friends where the relationship status is 'friends'
    friends_relations = Relationship.objects.filter(
        (models.Q(from_user=request.user) | models.Q(to_user=request.user)),
        status='friends'
    )

    return render(request, 'user_app/dashboard.html', {
        'pending_requests': pending_requests,
        'friends': friends_relations,
    })

def logout_view(request):
    logout(request)
    response = redirect('landing')
    response.delete_cookie('refresh_token')
    response.delete_cookie('access_token')
    return response

def local_login_view(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            logout(request)
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return set_jwt_cookie_and_redirect(user)
    else:
        form = AuthenticationForm()
        
    return render(request, 'user_app/login.html', {'form': form})

def signin_options_view(request):
    return render(request, 'user_app/signin_options.html')

def signup_options_view(request):
    return render(request, 'user_app/signup_options.html')

# user_app/views.py
from django.shortcuts import render
from .models import CustomUser

def debug_user_list(request):
    """Temporary dev-only view to see all users in the DB."""
    users = CustomUser.objects.all().order_by('-id') # Newest users first
    return render(request, 'user_app/debug_user_list.html', {'users': users})

@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            # If the checkbox is checked, delete the avatar file reference
            if form.cleaned_data.get('remove_avatar'):
                user.avatar = None
            user.save()
            return redirect('dashboard')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'user_app/edit_profile.html', {'form': form})


@login_required
def profile_view(request):
    # Handle adding a user by name
    if request.method == "POST" and "target_username" in request.POST:
        target_name = request.POST.get("target_username")
        try:
            target_user = CustomUser.objects.get(username=target_name)
            if target_user == request.user:
                messages.error(request, "You cannot add yourself.")
            else:
                Relationship.objects.get_or_create(from_user=request.user, to_user=target_user)
                messages.success(request, f"Request sent to {target_name}!")
        except CustomUser.DoesNotExist:
            messages.error(request, "User not found.")

    # Handle approving a request
    if request.method == "POST" and "approve_id" in request.POST:
        rel = Relationship.objects.get(id=request.POST.get("approve_id"), to_user=request.user)
        rel.status = 'friends'
        rel.save()

    # Data for the template
    pending_requests = Relationship.objects.filter(to_user=request.user, status='pending')
    friends = Relationship.objects.filter(
        models.Q(from_user=request.user, status='friends') | 
        models.Q(to_user=request.user, status='friends')
    )
    
    return render(request, 'user_app/dashboard.html', {
        'pending_requests': pending_requests,
        'friends': friends
    })


@login_required
def delete_profile_view(request):
    if request.method == 'POST':
        user = request.user
        user.delete() # This also triggers your signal to delete the avatar file!
        logout(request) # Log the user out after deletion
        messages.success(request, "Your account has been successfully deleted.")
        return redirect('landing') # Redirect to signup or home
        
    return render(request, 'user_app/delete_confirm.html')
