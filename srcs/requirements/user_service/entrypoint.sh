#!/bin/sh

# Check required environment variables
[ -z "$POSTGRES_HOST" ] && echo "Error: POSTGRES_HOST not set" && exit 1
[ -z "$POSTGRES_PORT" ] && echo "Error: POSTGRES_PORT not set" && exit 1
[ -z "$DJANGO_SUPERUSER_USERNAME" ] && echo "Error: DJANGO_SUPERUSER_USERNAME not set" && exit 1
[ -z "$DJANGO_SUPERUSER_EMAIL" ] && echo "Error: DJANGO_SUPERUSER_EMAIL not set" && exit 1
[ -z "$DJANGO_SUPERUSER_PASSWORD" ] && echo "Error: DJANGO_SUPERUSER_PASSWORD not set" && exit 1
[ -z "$DJANGO_SUPERUSER_DISPLAY_NAME" ] && echo "Error: DJANGO_SUPERUSER_DISPLAY_NAME not set" && exit 1

DB_HOST="$POSTGRES_HOST"
DB_PORT="$POSTGRES_PORT"

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
import sys

def get_env_strict(var):
    val = os.getenv(var)
    if not val:
        print(f"Error: {var} environment variable is not set inside Python.")
        sys.exit(1)
    return val

User = get_user_model()
username = get_env_strict('DJANGO_SUPERUSER_USERNAME')
email = get_env_strict('DJANGO_SUPERUSER_EMAIL')
password = get_env_strict('DJANGO_SUPERUSER_PASSWORD')
display_name = get_env_strict('DJANGO_SUPERUSER_DISPLAY_NAME')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password, display_name=display_name)
    print(f"Superuser '{username}' (display name: '{display_name}') created successfully.")
else:
    print(f"Superuser '{username}' already exists.")
END
# ------------------------------------

echo "Starting Django server..."
exec "$@"