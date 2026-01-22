import requests
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import login
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser

class FortyTwoLoginView(APIView):
    """Redirects the user to the 42 Authorization page."""
    def get(self, request):
        url = (
            f"https://api.intra.42.fr/oauth/authorize"
            f"?client_id={settings.FT_CLIENT_ID}"
            f"&redirect_uri={settings.FT_REDIRECT_URI}"
            f"&response_type=code"
        )
        return redirect(url)

class FortyTwoCallbackView(APIView):
    """Handles the return from 42 and logs the user in."""
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=400)

        # 1. Exchange code for Access Token
        token_data = requests.post("https://api.intra.42.fr/oauth/token", data={
            "grant_type": "authorization_code",
            "client_id": settings.FT_CLIENT_ID,
            "client_secret": settings.FT_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.FT_REDIRECT_URI,
        }).json()

        access_token = token_data.get("access_token")

        # 2. Get User Info from 42 API
        user_info = requests.get("https://api.intra.42.fr/v2/me", headers={
            "Authorization": f"Bearer {access_token}"
        }).json()

        # 3. Create or Get User in our Database
        user, created = CustomUser.objects.get_or_create(
            intra_id=user_info['id'],
            defaults={
                'username': user_info['login'],
                'display_name': user_info.get('displayname'),
                'email': user_info['email'],
                'avatar_url': user_info['image']['link'],
            }
        )

        login(request, user)
        return Response({"message": "Successfully logged in!", "user": user.username})