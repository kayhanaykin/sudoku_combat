# user_project/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from user_app import views # Import views here

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.landing_page, name='landing'),
    path('api/user/', include('user_app.urls')),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('setup/', views.profile_setup_view, name='profile_setup'),
    # Add this line so /logout/ works globally
    path('logout/', views.logout_view, name='logout'),
]

# Add this to serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)