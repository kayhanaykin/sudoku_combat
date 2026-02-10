import os
import sys
import django
import shutil
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

from user_app.models import CustomUser

def seed_local_users():
    # Klasör Yolları
    # /mnt/downloads -> Docker Compose'da bağladığın Downloads klasörü
    # /app/media/avatars -> Docker Volume olan medya klasörü
    DOWNLOADS_PATH = Path("/mnt/downloads")
    MEDIA_AVATARS_PATH = Path("/app/media/avatars")
    MEDIA_AVATARS_PATH.mkdir(parents=True, exist_ok=True)

    print("--- Admin hariç kullanıcılar temizleniyor ---")
    CustomUser.objects.filter(is_superuser=False).delete()
    
    print("--- 5 Yeni Yerel Kullanıcı Oluşturuluyor ---")
    for i in range(1, 6):
        u_name = f"user{i}"
        
        # 1. Dosyayı Bul ve Kopyala
        src_file_name = f"download ({i}).jpeg"
        src_path = DOWNLOADS_PATH / src_file_name
        target_file_name = f"avatar_{u_name}.jpeg"
        target_path = MEDIA_AVATARS_PATH / target_file_name

        if src_path.exists():
            shutil.copy(str(src_path), str(target_path))
            # Veritabanına kaydedilecek URL (Nginx'in çözebileceği format)
            db_avatar_url = f"/media/avatars/{target_file_name}"
            print(f"Resim kopyalandı: {src_file_name} -> {target_file_name}")
        else:
            # Resim yoksa boş kalmasın veya varsayılan bir URL verilsin
            db_avatar_url = None
            print(f"UYARI: {src_path} bulunamadı! Kullanıcı resimsiz oluşturuluyor.")

        # 2. Kullanıcıyı Oluştur
        if src_path:
            shutil.copy(str(src_path), str(target_path))
            
            # BURASI KRİTİK: Başına /media/ EKLEME. 
            # Sadece media klasörünün içindeki yolu yaz.
            db_avatar_path = f"avatars/{target_file_name}" 
            
            print(f"Resim kopyalandı: {src_file_name} -> {target_file_name}")
        else:
            db_avatar_path = None

        # Kullanıcıyı oluştur
        CustomUser.objects.create_user(
            username=u_name,
            password="1",
            email=f"{u_name}@example.com",
            display_name=f"Player_{i}",
            # Eğer modelinde alanın adı 'avatar' ise (ImageField):
            avatar=db_avatar_path, 
            # Eğer alanın adı 'avatar_url' ise (Charfield):
            # avatar_url=db_avatar_path,
            is_profile_complete=True,
            intra_id=None
        )
        print(f"Eklendi: {u_name}")

if __name__ == "__main__":
    seed_local_users()
    print("\nBaşarıyla tamamlandı!")