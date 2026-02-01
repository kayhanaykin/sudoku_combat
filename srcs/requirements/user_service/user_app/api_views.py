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

from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    # Eğer kullanıcı zaten giriş yapmışsa çıkış yaptır (isteğe bağlı)
    if request.user.is_authenticated:
        logout(request)

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Please provide both username and password."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Kullanıcıyı doğrula
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        # Eğer JWT kullanıyorsan burada token oluşturup cookie'ye set edebilirsin
        # Şimdilik başarılı mesajı ve kullanıcı bilgilerini dönüyoruz
        return Response({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "display_name": getattr(user, 'display_name', user.username)
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )