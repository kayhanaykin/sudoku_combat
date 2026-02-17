from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

# Channels katmanı (WebSocket haberleşmesi için)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Modeller ve Serializerlar
from .models import CustomUser, Relationship
from .serializers import CustomUserSerializer, RegisterSerializer

# --- YARDIMCI FONKSİYONLAR (JWT & COOKIE) ---

def get_tokens_for_user(user):
    """Kullanıcı için manuel JWT token üretir."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def set_jwt_cookies(response, user):
    """Response nesnesine JWT token'larını cookie olarak ekler."""
    tokens = get_tokens_for_user(user)
    
    # Access Token (Kısa ömürlü - 1 saat)
    response.set_cookie(
        key='access_token',
        value=tokens['access'],
        httponly=False,  # Frontend okuyabilsin diye False (WebSocket için)
        samesite='Lax',
        secure=True,
        max_age=3600
    )
    
    # Refresh Token (Uzun ömürlü - 1 gün)
    response.set_cookie(
        key='refresh_token',
        value=tokens['refresh'],
        httponly=True,   # Güvenlik için JS okuyamasın
        samesite='Lax',
        secure=True,
        max_age=86400
    )

# --- TEMEL VIEWLER ---

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Frontend'in CSRF token alabilmesi için endpoint."""
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_api(request):
    """Giriş yapmış kullanıcının bilgilerini döner."""
    serializer = CustomUserSerializer(request.user)
    return Response(serializer.data)

# --- AUTH (GİRİŞ/KAYIT/ÇIKIŞ) ---

# --- EN TEPEYE EKLENECEK IMPORTLAR ---
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# --- LOGIN API GÜNCELLEMESİ ---
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_api(request):
    if request.method == 'GET':
        return Response({"message": "CSRF cookie set"})

    if request.user.is_authenticated:
        logout(request)

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        
        user.is_online = True
        user.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "online_users",
            {
                "type": "user_update",
                "user_id": user.id,
                "status": "online"
            }
        )

        response = Response({
            "message": "Login successful", 
            "user": {
                "id": user.id, 
                "username": user.username,
                "avatar": user.avatar.url if user.avatar else None
            }
        }, status=200)
        
        set_jwt_cookies(response, user)
        return response
    
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_api(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        
        response = Response({
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "username": user.username
            }
        }, status=201)
        
        set_jwt_cookies(response, user)
        return response
    return Response(serializer.errors, status=400)

from django.contrib.auth import logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def logout_api(request):
    if request.method == "POST":
        logout(request) # Django session'ı kapatır
        response = JsonResponse({'message': 'Successfully logged out'})
        
        # Tüm çerezleri sil
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
        return response
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# --- ARKADAŞLIK İŞLEMLERİ ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def friend_action_api(request):
    if request.method == 'GET':
        pending = Relationship.objects.filter(to_user=request.user, status='pending')
        
        friends_rel = Relationship.objects.filter(
            Q(status='friends') & (Q(from_user=request.user) | Q(to_user=request.user))
        )

        friends_data = []
        for rel in friends_rel:
            friend_user = rel.to_user if rel.from_user == request.user else rel.from_user
            
            d_name = getattr(friend_user, 'display_name', None) or friend_user.username

            friends_data.append({
                "id": friend_user.id,
                "username": friend_user.username,
                "display_name": d_name,
                "avatar": friend_user.avatar.url if friend_user.avatar else None,
                "is_online": getattr(friend_user, 'is_online', False),
                "rel_id": rel.id
            })

        pending_data = []
        for r in pending:
            p_d_name = getattr(r.from_user, 'display_name', None) or r.from_user.username

            pending_data.append({
                "id": r.from_user.id,
                "username": r.from_user.username,
                "display_name": p_d_name,
                "avatar": r.from_user.avatar.url if r.from_user.avatar else None,
                "rel_id": r.id,
                "type": "incoming"
            })

        return Response({
            "friends": friends_data, 
            "pending_requests": pending_data
        })

    # --- POST: Aksiyonlar (Send, Approve, Remove) ---
    action = request.data.get("action")
    
    if action == "send":
        target_username = request.data.get("target_username") 
        try:
            target_user = CustomUser.objects.get(username=target_username)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        if target_user == request.user:
             return Response({"error": "You cannot add yourself."}, status=400)

        exists = Relationship.objects.filter(
            (Q(from_user=request.user) & Q(to_user=target_user)) |
            (Q(from_user=target_user) & Q(to_user=request.user))
        ).exists()

        if exists:
            return Response({"message": "Relationship already exists"}, status=200)

        Relationship.objects.create(from_user=request.user, to_user=target_user, status='pending')
        return Response({"message": f"Request sent to {target_username}!"}, status=201)

    elif action == "approve":
        try:
            rel_id = request.data.get("rel_id")
            rel = Relationship.objects.get(id=rel_id, to_user=request.user)
            rel.status = 'friends'
            rel.save()
            return Response({"message": "Friend request approved!"})
        except Relationship.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

    elif action == "remove":
        rel_id = request.data.get("rel_id")
        Relationship.objects.filter(
            Q(id=rel_id) & (Q(from_user=request.user) | Q(to_user=request.user))
        ).delete()
        return Response({"message": "Friendship/Request removed."})

    return Response({"error": "Invalid action."}, status=400)

# --- PROFİL DÜZENLEME ---

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def edit_api(request):
    user = request.user
    data = request.data

    if 'display_name' in data:
        user.display_name = data['display_name']
    
    if 'email' in data:
        user.email = data['email']

    if data.get('remove_avatar') == 'true' or data.get('remove_avatar') is True:
        user.avatar = None
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