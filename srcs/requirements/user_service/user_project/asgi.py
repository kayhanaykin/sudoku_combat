# user_project/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import user_app.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_project.settings')

application = ProtocolTypeRouter({
    # Standard HTTP requests
    "http": get_asgi_application(),
    
    # WebSocket requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            user_app.routing.websocket_urlpatterns
        )
    ),
})