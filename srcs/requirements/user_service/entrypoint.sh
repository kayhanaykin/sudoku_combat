#!/bin/sh

# Use default values if variables are not set
DB_HOST="${POSTGRES_HOST:-user_db}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "Waiting for postgres at $DB_HOST:$DB_PORT..."

# Python check with explicit variables
python3 << END
import socket
import time
import sys

while True:
    try:
        with socket.create_connection(("$DB_HOST", int("$DB_PORT")), timeout=1):
            print("Postgres is up!")
            break
    except OSError:
        print("Postgres not ready yet, retrying...")
        time.sleep(1)
END

echo "Applying migrations..."
# makemigrations is usually done in dev, but safe here for 42 project
python manage.py makemigrations user_app --noinput
python manage.py migrate --noinput

# --- AUTOMATED SUPERUSER CREATION ---
echo "Checking for superuser..."
python manage.py shell << END
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"Superuser '{username}' created successfully.")
else:
    print(f"Superuser '{username}' already exists.")
END
# ------------------------------------

echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8001