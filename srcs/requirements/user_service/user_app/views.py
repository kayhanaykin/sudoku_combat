import requests
from django.conf import settings
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser

class FortyTwoLoginView(APIView):
    """Redirects the user to the 42 Authorization page."""
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
            return Response({"error": "Failed to get access token"}, status=400)
            
        access_token = token_response.json().get("access_token")

        # 2. Get User Info
        user_info = requests.get("https://api.intra.42.fr/v2/me", headers={
            "Authorization": f"Bearer {access_token}"
        }).json()

        intra_id = user_info.get('id')
        intra_login = user_info.get('login')

        # 3. Create or Get User
        user, created = CustomUser.objects.get_or_create(
            intra_id=intra_id,
            defaults={
                'username': f"42_{intra_login}_{intra_id}",
                'is_active': True,
            }
        )

        login(request, user)

        if created or not user.email:
            return redirect('/profile/setup/') 
            
        return redirect('/dashboard/')

def landing_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard') 
    return render(request, 'user_app/login.html')

def dashboard_view(request):
    if not request.user.is_authenticated:
        return redirect('landing')
    return render(request, 'user_app/dashboard.html')

def logout_view(request):
    logout(request)
    return redirect('landing')