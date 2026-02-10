import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from user_app.middleware import JWTAuthMiddleware
import user_app.routing  # <--- THIS LINE IS ESSENTIAL

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_project.settings')

application = ProtocolTypeRouter({
    # Standard HTTP requests
    "http": get_asgi_application(),
    
    # WebSocket requests
    "websocket": JWTAuthMiddleware(
        URLRouter(
            user_app.routing.websocket_urlpatterns
        )
    ),
})
