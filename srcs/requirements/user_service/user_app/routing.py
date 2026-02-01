# user_app/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Add ^ to signify the start of the string after the protocol
    re_path(r'^ws/presence/$', consumers.PresenceConsumer.as_asgi()),
]