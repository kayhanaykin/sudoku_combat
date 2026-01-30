from django.urls import path
from . import api_views

urlpatterns = [
    path('me/', api_views.current_user_api, name='api-current-user'),
    path('signup/', api_views.signup_api, name='api-signup'),
]