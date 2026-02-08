
ENDPOINT: /api/v1/user/me/ 

METHOD: 
GET 

BODY: 
Yok

OUTPUT JSON: 
{ "id": 5, "username": "user3", "display_name": "user3", "avatar": "/media/avatars/download_3.jpeg", "is_online": false, "is_profile_complete": true }



ENDPOINT: /api/v1/user/signup/

METHOD: 
POST 

BODY (JSON): 
{ "username": "deneme_user", "password": "GuvenliSifre123!", "email": "deneme@example.com", "avatar": "Opsiyonel (File)" } 

OUTPUT JSON: (farklı error mesajlari)
{ "message": "User created successfully", "user": { "username": "deneme_user", "display_name": "deneme_user" } }
{"password":["This password is too short. It must contain at least 8 characters.","This password is too common.","This password is entirely numeric."]}

ENDPOINT: /api/v1/user/login/ 

METHOD:
POST

BODY (JSON): 
{ "username": "deneme_user", "password": "GuvenliSifre123!" }

OUTPUT JSON 
(Success - 200 OK): { "message": "Login successful", "user": { "id": 7, "username": "deneme_user", "display_name": "deneme_user" } }
(Error - 401 Unauthorized): { "error": "Invalid username or password." }