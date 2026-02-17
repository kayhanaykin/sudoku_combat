"""
Django settings for user_project project.
"""

from pathlib import Path
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-2^#2)59o(yi_5dcyj1n$v!ssa1#x$v#)%z)l1$6%5)i$7rylbp')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allowed Hosts: Nginx'ten gelen istekleri ve internal servis çağrılarını kabul et
# ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'user_service', 'ekay.42.fr']
ALLOWED_HOSTS = ['*']


# Application definition
INSTALLED_APPS = [
    'daphne', # ASGI server (En üstte olmalı)
    'channels', # WebSockets
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'user_app', # Senin uygulaman
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'user_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'user_project.wsgi.application'
ASGI_APPLICATION = 'user_project.asgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'user_db_name'),
        'USER': os.getenv('POSTGRES_USER', 'user_name'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'user_password'),
        'HOST': 'user_db',  # docker-compose servis adı
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Redis Channel Layer (WebSockets için)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('user_redis', 6379)], # docker-compose servis adı
        },
    },
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Production için gerekli

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Klasör yoksa oluştur
if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'user_app.CustomUser'

# 42 API Credentials
FT_CLIENT_ID = os.getenv('FT_CLIENT_ID')
FT_CLIENT_SECRET = os.getenv('FT_CLIENT_SECRET')
FT_REDIRECT_URI = os.getenv('FT_REDIRECT_URI')

# DRF Configuration
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.TemplateHTMLRenderer',
    ]
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=365),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

LOGIN_URL = '/'
LOGIN_REDIRECT_URL = '/dashboard/'

# --- SECURITY & PROXY SETTINGS ---

# 1. CSRF Trusted Origins (Browser'dan Nginx'e gelen adresler)
# Port 8443 üzerinden gelindiği için bunları eklemeliyiz.
CSRF_COOKIE_HTTPONLY = False
CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8443",
    "wss://localhost:8443",
    "http://localhost:8443",
    "ws://localhost:8443",
    "http://127.0.0.1:8443",
]

# 2. Proxy Headers
# Nginx HTTPS sonlandırıp içeriye HTTP gönderdiği için Django'nun HTTPS olduğunu anlaması lazım.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

ALLOWED_HOSTS = ['*']

CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8443",
    "wss://localhost:8443",
]