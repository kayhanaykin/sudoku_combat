from rest_framework import serializers
from .models import CustomUser, Relationship
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # API'da hangi alanları görmek istiyorsan onları ekle
        fields = ['id', 'username', 'display_name', 'avatar', 'is_online', 'is_profile_complete']

class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relationship
        fields = '__all__'
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'avatar', 'password')

    def validate_password(self, value):
        try:
            # settings.py içindeki tüm kuralları (uzunluk, benzerlik vb.) kontrol eder
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        # Kullanıcıyı oluştur ve parolayı hashle
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            avatar=validated_data.get('avatar', None),
            password=validated_data['password']
        )
        # Senin 'local_signup_view' içindeki özel mantığın:
        user.display_name = user.username
        user.is_profile_complete = True
        user.save()
        return user