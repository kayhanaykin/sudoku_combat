import requests
from django.conf import settings
from django.shortcuts import redirect, render, get_object_or_404
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
from django.http import JsonResponse

# --- HELPER FOR UNLIMITED LOGIN ---

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

def set_jwt_cookie_and_redirect(user, request, target_url=None):
    # 1. Generate the tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    # 2. Refined JSON Check
    # We only return JSON if the request explicitly asks for it AND it's not a standard browser page load
    is_json_requested = 'application/json' in request.headers.get('Accept', '')
    is_postman_or_api = request.content_type == 'application/json'
    
    # Check if this is a standard HTML form submission (typical browser behavior)
    is_browser_form = request.headers.get('Content-Type') == 'application/x-www-form-urlencoded'

    if (is_json_requested or is_postman_or_api) and not is_browser_form:
        return JsonResponse({
            'message': 'Login successful',
            'access': access_token,
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'display_name': getattr(user, 'display_name', user.username)
            }
        })

    # 3. Standard Browser Redirect Logic
    # Check if profile is complete (adjust 'is_profile_complete' to your actual model field)
    is_complete = getattr(user, 'is_profile_complete', True)
    target = target_url or ('dashboard' if is_complete else 'setup')
    
    response = redirect(target)
    
    # 4. Set Cookies
    # refresh_token remains secure and hidden (httponly=True)
    response.set_cookie(
        key='refresh_token', 
        value=str(refresh), 
        httponly=True, 
        secure=True, 
        samesite='Lax'
    )
    
    # access_token MUST be accessible by JS (httponly=False) so the WebSocket can grab it
    response.set_cookie(
        key='access_token', 
        value=access_token, 
        httponly=False,  # <--- CRITICAL: Set to False for WebSockets
        secure=True, 
        samesite='Lax'
    )
    
    return response

# --- AUTHENTICATION VIEWS ---

class FortyTwoLoginView(APIView):
    """Force logout then redirect to 42 Authorization."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # ALWAYS logout first. This destroys the previous 'sessionid' cookie
        # and ensures the 42 callback creates/logs in a fresh session.
        if request.user.is_authenticated:
            logout(request)
            
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
        return set_jwt_cookie_and_redirect(user, request, target_url=target)

def local_signup_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST, request.FILES) # Or your CustomUserCreationForm
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
        form = CustomUserCreationForm()
    return render(request, 'user_app/signup.html', {'form': form})

# --- PAGE VIEWS ---

def landing_page(request):
    return render(request, 'user_app/landing.html')

def profile_setup_view(request):
    if request.method == 'POST':
        # Here we use UserProfileForm because the user already exists in the DB
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_profile_complete = True
            user.save()
            return redirect('dashboard')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'user_app/setup.html', {'form': form})
        

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import CustomUser, Relationship
from django.db.models import Q

@login_required
def dashboard_view(request):
    if not request.user.is_authenticated:
        return redirect('login')

    # --- 1. HANDLE ACTIONS (POST) ---
    if request.method == "POST":
        # ACTION: Add Friend
        if "target_username" in request.POST:
            target_name = request.POST.get("target_username").strip()
            try:
                target_user = CustomUser.objects.get(username=target_name)
                if target_user == request.user:
                    messages.error(request, "You cannot add yourself.")
                else:
                    # Check if ANY relationship already exists
                    exists = Relationship.objects.filter(
                        (Q(from_user=request.user, to_user=target_user) | 
                         Q(from_user=target_user, to_user=request.user))
                    ).exists()
                    
                    if exists:
                        messages.info(request, "A request is already pending or you are already friends.")
                    else:
                        Relationship.objects.create(from_user=request.user, to_user=target_user, status='pending')
                        messages.success(request, f"Request sent to {target_name}!")
            except CustomUser.DoesNotExist:
                messages.error(request, "User not found.")
            return redirect('dashboard')

        # ACTION: Approve Request
        if "approve_id" in request.POST:
            rel = get_object_or_404(Relationship, id=request.POST.get("approve_id"), to_user=request.user)
            rel.status = 'friends'
            rel.save()
            messages.success(request, "Friend request approved!")
            return redirect('dashboard')

        # ACTION: Remove Friend
        if "remove_id" in request.POST:
            rel_id = request.POST.get("remove_id")
            # This deletes the relationship regardless of who started it
            Relationship.objects.filter(
                Q(id=rel_id) & (Q(from_user=request.user) | Q(to_user=request.user))
            ).delete()
            messages.success(request, "Friend removed.")
            return redirect('dashboard')

    # --- 2. FETCH DATA (GET) ---
    # Make sure these strings ('pending', 'friends') match your Model EXACTLY
    pending_requests = Relationship.objects.filter(to_user=request.user, status='pending')
    
    friends_relations = Relationship.objects.filter(
        Q(status='friends') & (Q(from_user=request.user) | Q(to_user=request.user))
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

from django.views.decorators.csrf import csrf_exempt

import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def local_login_view(request):
    if request.method == "POST":
        # Handle logout if user is already logged in (prevents session conflicts)
        if request.user.is_authenticated:
            logout(request)
        
        # --- CASE 1: JSON Request (Postman / API) ---
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
                
                user = authenticate(username=username, password=password)
                if user:
                    # NOTE: We do NOT call login(request, user) here.
                    # This avoids creating a sessionid cookie, which is what 
                    # triggers the CSRF/Referer 403 error in Postman.
                    return set_jwt_cookie_and_redirect(user, request)
                
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        # --- CASE 2: Standard Form (Browser) ---
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            # We DO call login() for the browser so the session works normally
            login(request, user)
            return set_jwt_cookie_and_redirect(user, request)
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


from rest_framework import generics
from .models import CustomUser
from .serializers import CustomUserSerializer

class MyModelListAPI(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer