from django.urls import path
from . import api_views

urlpatterns = [
    path('me/', api_views.current_user_api, name='api-current-user'),
    path('friends/', api_views.friend_action_api, name='api-friends'),
    path('signup/', api_views.signup_api, name='api-signup'),
    path('login/', api_views.login_api, name='api_login'),
    path('profile/edit/', api_views.edit_api, name='api_login'),
]