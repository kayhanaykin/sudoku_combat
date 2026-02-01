# user_app/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    # Optional: Makes email mandatory during signup
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        # Added 'avatar' here so it appears on the signup page
        fields = ("username", "email", "avatar") 

class UserProfileForm(forms.ModelForm):
    remove_avatar = forms.BooleanField(required=False, label="Remove current avatar")

    class Meta:
        model = CustomUser
        fields = ['display_name', 'email', 'avatar']