from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import CustomUser
from .serializers import CustomUserSerializer # İsim değişti!

@api_view(['GET'])
def current_user_api(request):
    """Giriş yapmış kullanıcının bilgilerini JSON döner."""
    if request.user.is_authenticated:
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    return Response({"error": "Not authenticated"}, status=401)

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import login
from .serializers import RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny]) # Kayıt olmak için giriş yapmış olmaya gerek yok
def signup_api(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user) # Session tabanlı auth kullanıyorsan giriş yaptırır
        return Response({
            "message": "User created successfully",
            "user": {
                "username": user.username,
                "display_name": user.display_name
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)