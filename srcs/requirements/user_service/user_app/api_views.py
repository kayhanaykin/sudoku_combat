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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Relationship, CustomUser

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def friend_action_api(request):
    # --- GET: Listeleme ---
    if request.method == 'GET':
        # Bekleyen istekler (Sana gelenler)
        pending = Relationship.objects.filter(to_user=request.user, status='pending')
        
        # Onaylanmış arkadaşlar
        friends_rel = Relationship.objects.filter(
            Q(status='friends') & (Q(from_user=request.user) | Q(to_user=request.user))
        )

        # Arkadaş Listesi
        friends_data = []
        for rel in friends_rel:
            friend_user = rel.to_user if rel.from_user == request.user else rel.from_user
            
            # GÜVENLİ ERİŞİM: display_name yoksa username kullan
            d_name = getattr(friend_user, 'display_name', None)
            if not d_name:
                d_name = friend_user.username

            friends_data.append({
                "id": friend_user.id,
                "username": friend_user.username,
                "display_name": d_name,
                "avatar": friend_user.avatar.url if friend_user.avatar else None,
                "is_online": getattr(friend_user, 'is_online', False),
                "rel_id": rel.id
            })

        # Bekleyen İstekler Listesi
        pending_data = []
        for r in pending:
            # GÜVENLİ ERİŞİM
            p_d_name = getattr(r.from_user, 'display_name', None)
            if not p_d_name:
                p_d_name = r.from_user.username

            pending_data.append({
                "id": r.from_user.id,
                "username": r.from_user.username,
                "display_name": p_d_name,
                "avatar": r.from_user.avatar.url if r.from_user.avatar else None,
                "rel_id": r.id
            })

        return Response({
            "friends": friends_data, 
            "pending_requests": pending_data
        })

    # --- POST: Aksiyonlar (Send, Approve, Remove) ---
    # (Burası aynı kalıyor, değiştirmene gerek yok ama tam olsun diye ekliyorum)
    action = request.data.get("action")
    
    if action == "send":
        target_username = request.data.get("target_username") 
        try:
            target_user = CustomUser.objects.get(username=target_username)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        if target_user == request.user:
             return Response({"error": "You cannot add yourself."}, status=400)

        rel, created = Relationship.objects.get_or_create(
            from_user=request.user,
            to_user=target_user,
            defaults={'status': 'pending'}
        )
        return Response({"message": f"Request sent to {target_username}!"}, status=201)

    elif action == "approve":
        try:
            rel = Relationship.objects.get(id=request.data.get("rel_id"), to_user=request.user)
            rel.status = 'friends'
            rel.save()
            return Response({"message": "Friend request approved!"})
        except Relationship.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

    elif action == "remove":
        Relationship.objects.filter(
            Q(id=request.data.get("rel_id")) & (Q(from_user=request.user) | Q(to_user=request.user))
        ).delete()
        return Response({"message": "Friendship/Request removed."})

    return Response({"error": "Invalid action."}, status=400)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.core.files.base import ContentFile
import base64

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.core.files.base import ContentFile
import base64

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def edit_api(request):
    user = request.user
    
    # request.data form verilerini içerir
    data = request.data

    # Display name ve email güncelleme
    if 'display_name' in data:
        user.display_name = data['display_name']
    
    if 'email' in data:
        user.email = data['email']

    # Avatar güncelleme (Dosya Yükleme Mantığı)
    # Frontend 'remove_avatar' string olarak "true" gönderebilir, kontrol edelim.
    if data.get('remove_avatar') == 'true' or data.get('remove_avatar') is True:
        user.avatar = None
    
    # request.FILES üzerinden dosyayı alıyoruz (Base64 decode gerekmez)
    elif 'avatar' in request.FILES:
        user.avatar = request.FILES['avatar']

    try:
        user.save()
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "display_name": getattr(user, 'display_name', user.username),
                "email": user.email,
                "avatar": user.avatar.url if user.avatar else None
            }
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)