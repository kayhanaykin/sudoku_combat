import os
import sys
import django
import shutil
import requests
import random
from pathlib import Path

# 1. Mevcut dizini ( /app ) yola ekle
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# 2. settings.py dosyasını dinamik olarak bul
def find_settings_module():
    for path in BASE_DIR.rglob("settings.py"):
        parts = path.relative_to(BASE_DIR).with_suffix("").parts
        return ".".join(parts)
    return None

settings_module = find_settings_module()
if settings_module:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
    print(f"--- Ayar Modülü Tespit Edildi: {settings_module} ---")
else:
    print("HATA: settings.py dosyası bulunamadı!")
    sys.exit(1)

try:
    django.setup()
except Exception as e:
    print(f"HATA: Django başlatılamadı: {e}")
    sys.exit(1)

from user_app.models import CustomUser, Relationship
from django.db.models import Q

STATS_SERVICE_URL = "http://stats_service:8090/api/stats/report"

def record_stats(username, diff, mode, result, time_sec=None, opponent=None):
    """Helper to record game results in stats_service"""
    payload = {
        "username": username,
        "difficulty": diff,
        "mode": mode,
        "result": result
    }
    if time_sec:
        payload["time_seconds"] = time_sec
    if opponent:
        payload["opponent"] = opponent
    
    try:
        res = requests.post(STATS_SERVICE_URL, json=payload, timeout=5)
        if res.status_code == 200:
            print(f"  [Stats] Recorded {result} for {username} (mode: {mode}, diff: {diff})")
        else:
            print(f"  [Stats Errror] {res.status_code}: {res.text}")
    except Exception as e:
        print(f"  [Stats Exception] {e}")

def seed_data():
    DOWNLOADS_PATH = Path("/mnt/downloads")
    MEDIA_AVATARS_PATH = Path("/app/media/avatars")
    MEDIA_AVATARS_PATH.mkdir(parents=True, exist_ok=True)

    print("--- Admin hariç kullanıcılar/ilişkiler temizleniyor ---")
    Relationship.objects.all().delete()
    CustomUser.objects.filter(is_superuser=False).delete()
    
    users = []
    turkish_names = ["Caner", "Melis", "Mert", "Selin", "Batuhan"]
    print("--- 5 Yeni Yerel Kullanıcı Oluşturuluyor ---")
    for i in range(1, 6):
        u_name = f"user{i}"
        d_name = turkish_names[i-1]
        src_file_name = f"download ({i}).jpeg"
        src_path = DOWNLOADS_PATH / src_file_name
        target_file_name = f"avatar_{u_name}.jpeg"
        target_path = MEDIA_AVATARS_PATH / target_file_name

        db_avatar_path = None
        if src_path.exists():
            shutil.copy(str(src_path), str(target_path))
            db_avatar_path = f"avatars/{target_file_name}" 
            print(f"Resim kopyalandı: {src_file_name} -> {target_file_name}")

        user = CustomUser.objects.create_user(
            username=u_name,
            password="1",
            email=f"{u_name}@example.com",
            display_name=d_name,
            avatar=db_avatar_path, 
            intra_id=None
        )
        users.append(user)
        print(f"Eklendi: {u_name}")

    # 1. Add Friendships
    print("\n--- Arkadaşlık İlişkileri Kuruluyor ---")
    # user1 is friends with user2, user3
    # user2 is friends with user3
    # user4 is friends with user5
    pairs = [(0, 1), (0, 2), (1, 2), (3, 4)]
    for p in pairs:
        u1, u2 = users[p[0]], users[p[1]]
        Relationship.objects.create(from_user=u1, to_user=u2, status='friends')
        print(f"Dostluk kuruldu: {u1.username} <-> {u2.username}")

    # 2. Add Match History (Stats)
    print("\n--- Oyun Geçmişi ve İstatistikleri İşleniyor ---")
    
    # Offline Games (Solo)
    modes = ["offline"]
    for u in users:
        print(f"Processing solo games for {u.username}...")
        # 3 Wins, 2 Losses
        for d in [1, 2, 3]: # Easy, Medium, Hard
            record_stats(u.username, d, "offline", "win", time_sec=random.randint(120, 600))
        for d in [2, 4]: # Medium, Expert
            record_stats(u.username, d, "offline", "lose")

    # Online Games (Combat)
    print("\nProcessing combat matches with diverse outcomes...")
    # List of tuples (winner, loser, difficulty)
    matches = [
        ("user1", "user2", 1), ("user1", "user3", 2), ("user1", "user4", 3), ("user1", "user5", 4),
        ("user1", "user2", 5), ("user1", "user3", 1), ("user1", "user4", 2), # user1 has 7 wins
        
        ("user2", "user1", 3), ("user2", "user3", 4), ("user2", "user4", 5), ("user2", "user5", 1),
        ("user2", "user1", 2), ("user2", "user3", 3), ("user2", "user4", 4), # user2 has 7 wins
        
        ("user3", "user1", 5), ("user3", "user2", 1), ("user3", "user4", 2), ("user3", "user5", 3),
        ("user3", "user1", 4), ("user3", "user2", 5), ("user3", "user4", 1), # user3 has 7 wins
        
        ("user4", "user1", 2), ("user4", "user2", 3), ("user4", "user3", 4), ("user4", "user5", 5),
        ("user4", "user1", 1), ("user4", "user2", 2), ("user4", "user3", 3), # user4 has 7 wins
        
        ("user5", "user1", 4), ("user5", "user2", 5), ("user5", "user3", 1), ("user5", "user4", 2),
        ("user5", "user1", 3), ("user5", "user2", 4), ("user5", "user3", 5), # user5 has 7 wins
        
        # Adding some losses for each to balance
        ("user2", "user1", 1), ("user3", "user1", 2), ("user4", "user1", 3), # user1 gets 3 losses
        ("user1", "user2", 4), ("user3", "user2", 5), ("user4", "user2", 1), # user2 gets 3 losses
        ("user1", "user3", 2), ("user2", "user3", 3), ("user5", "user3", 4), # user3 gets 3 losses
        ("user1", "user4", 5), ("user2", "user4", 1), ("user3", "user4", 2), # user4 gets 3 losses
        ("user1", "user5", 3), ("user2", "user5", 4), ("user3", "user5", 5)  # user5 gets 3 losses
    ]
    
    for winner, loser, diff in matches:
        record_stats(winner, diff, "online", "win", opponent=loser)
        record_stats(loser, diff, "online", "lose", opponent=winner)

if __name__ == "__main__":
    seed_data()
    print("\nBaşarıyla tamamlandı!")