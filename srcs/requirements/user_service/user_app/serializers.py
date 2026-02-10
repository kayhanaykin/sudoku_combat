from rest_framework import serializers
from .models import CustomUser, Relationship
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions

class CustomUserSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField() 

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'display_name', 'avatar', 'status', 'is_online', 'is_profile_complete']

class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relationship
        fields = '__all__'

# CHECK THIS SECTION CAREFULLY - It must be named exactly RegisterSerializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'avatar', 'password')

    def validate_password(self, value):
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            avatar=validated_data.get('avatar', None),
            password=validated_data['password']
        )
        user.display_name = user.username
        user.is_profile_complete = True
        user.save()
        return user