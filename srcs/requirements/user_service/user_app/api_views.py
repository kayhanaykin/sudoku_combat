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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Relationship, CustomUser
from .serializers import CustomUserSerializer # Mevcut serializer'ın

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def friend_action_api(request):
    # --- GET: Listeleme ---
# --- GET: Listeleme ---
    if request.method == 'GET':
        # Bekleyen istekler (Sana gelenler)
        pending = Relationship.objects.filter(to_user=request.user, status='pending')
        
        # Onaylanmış arkadaşlar (İki yönden biri sensin)
        friends_rel = Relationship.objects.filter(
            Q(status='friends') & (Q(from_user=request.user) | Q(to_user=request.user))
        )

        # Verileri listeye dönüştürelim
        friends_data = []
        for rel in friends_rel:
            # Arkadaşın kim olduğunu bul (Sen olmayanı seç)
            friend_user = rel.to_user if rel.from_user == request.user else rel.from_user
            friends_data.append({
                "id": friend_user.id,
                "username": friend_user.username,
                "rel_id": rel.id # Silme işlemi için lazım olabilir
            })

        pending_data = [{
            "id": r.from_user.id,
            "username": r.from_user.username,
            "rel_id": r.id
        } for r in pending]

        return Response({
            "friends": friends_data, 
            "pending_requests": pending_data
        })
    # --- POST: Aksiyonlar ---
    action = request.data.get("action")
    
    if action == "send":
        # Request'ten gelen veriyi alıyoruz
        target_username = request.data.get("target_username") 
        
        # Kullanıcıyı buluyoruz
        target_user = get_object_or_404(CustomUser, username=target_username)
        
        # İlişkiyi oluşturuyoruz
        rel, created = Relationship.objects.get_or_create(
            from_user=request.user,
            to_user=target_user,
            defaults={'status': 'pending'}
        )
        
        # Burada 'target_name' yerine 'target_username' kullandığından emin ol
        return Response({"message": f"Request sent to {target_username}!"}, status=status.HTTP_201_CREATED)

    elif action == "approve":
        rel = get_object_or_404(Relationship, id=request.data.get("rel_id"), to_user=request.user)
        rel.status = 'friends'
        rel.save()
        return Response({"message": "Friend request approved!"})

    elif action == "remove":
        deleted, _ = Relationship.objects.filter(
            Q(id=request.data.get("rel_id")) & (Q(from_user=request.user) | Q(to_user=request.user))
        ).delete()
        if deleted:
            return Response({"message": "Friendship/Request removed."})
        return Response({"error": "Relationship not found."}, status=404)

    return Response({"error": "Invalid action."}, status=400)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.core.files.base import ContentFile
import base64

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_api(request):
    user = request.user
    data = request.data

    # Display name ve email güncelleme
    user.display_name = data.get('display_name', user.display_name)
    user.email = data.get('email', user.email)

    # Avatar güncelleme
    if data.get('remove_avatar', False):
        user.avatar = None
    elif data.get('avatar'):
        try:
            format, imgstr = data['avatar'].split(';base64,')
            ext = format.split('/')[-1]
            user.avatar.save(f"{user.username}_avatar.{ext}", ContentFile(base64.b64decode(imgstr)), save=False)
        except Exception:
            return Response({"error": "Invalid avatar format."}, status=400)

    user.save()
    return Response({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "email": user.email,
            "avatar": user.avatar.url if user.avatar else None
        }
    }, status=200)
