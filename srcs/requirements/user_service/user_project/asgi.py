import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from user_app.middleware import JWTAuthMiddleware
import user_app.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        JWTAuthMiddleware(
            URLRouter(
                user_app.routing.websocket_urlpatterns
            )
        )
    ),
})