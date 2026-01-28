# user_app/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("username", "email") # Add any other fields you want at signup


class UserProfileForm(forms.ModelForm):
    remove_avatar = forms.BooleanField(required=False, label="Remove current avatar")

    class Meta:
        model = CustomUser
        fields = ['display_name', 'email', 'avatar']