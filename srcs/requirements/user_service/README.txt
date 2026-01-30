
ENDPOINT: /api/v1/user/me/ 
METHOD: GET 
BODY: Yok 
OUTPUT JSON: 
{ "id": 5, "username": "user3", "display_name": "user3", "avatar": "/media/avatars/download_3.jpeg", "is_online": false, "is_profile_complete": true }

ENDPOINT: /api/v1/user/signup/ 
METHOD: POST 
BODY (JSON): { "username": "deneme_user", "password": "GuvenliSifre123!", "email": "deneme@example.com", "avatar": "Opsiyonel (File)" } 
OUTPUT JSON: { "message": "User created successfully", "user": { "username": "deneme_user", "display_name": "deneme_user" } }