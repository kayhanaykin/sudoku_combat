from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('auth/login/', views.FortyTwoLoginView.as_view(), name='fortytwo-login'),
    path('auth/callback/', views.FortyTwoCallbackView.as_view(), name='fortytwo-callback'),
    path('signup/', views.local_signup_view, name='local-signup'),
    path('setup/', views.profile_setup_view, name='profile_setup'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('logout/', views.logout_view, name='logout'),
    path('login/', views.local_login_view, name='login'),
    path('signin-choices/', views.signin_options_view, name='signin_options'),
    path('signup-choices/', views.signup_options_view, name='signup_options'),
    path('debug-users/', views.debug_user_list, name='debug_user_list'),
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
    path('profile/delete/', views.delete_profile_view, name='delete_profile'),
]