from django.urls import path
from user_app import views # Using absolute import for Docker stability

urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('auth/login/', views.FortyTwoLoginView.as_view(), name='fortytwo-login'),
    path('auth/callback/', views.FortyTwoCallbackView.as_view(), name='fortytwo-callback'),
    path('logout/', views.logout_view, name='logout'),
]