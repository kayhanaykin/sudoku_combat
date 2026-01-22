from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # 42 Intra Data
    intra_id = models.IntegerField(unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=50, unique=True, null=True, blank=True)
    avatar_url = models.URLField(max_length=500, null=True, blank=True)
    
    # 2FA Data (Security Requirement)
    is_2fa_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, null=True, blank=True)
    
    # Social Features (Friends & Status)
    is_online = models.BooleanField(default=False)
    # symmetrical=False means if I follow you, you don't automatically follow me
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)

    def __str__(self):
        return f"{self.username} ({self.display_name})"