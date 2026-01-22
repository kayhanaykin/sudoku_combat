from django.urls import path
from .views import FortyTwoLoginView, FortyTwoCallbackView

urlpatterns = [
    path('auth/login/', FortyTwoLoginView.as_view(), name='fortytwo-login'),
    path('auth/callback/', FortyTwoCallbackView.as_view(), name='fortytwo-callback'),
]