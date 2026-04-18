import os
import sys
import django
import shutil
import psycopg2
import psycopg2.extras
from pathlib import Path
from collections import defaultdict
from django.contrib.auth.hashers import make_password

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Find and load Django settings dynamically
def find_settings_module():
    for path in BASE_DIR.rglob("settings.py"):
        parts = path.relative_to(BASE_DIR).with_suffix("").parts
        return ".".join(parts)
    return None

settings_module = find_settings_module()
if not settings_module:
    print("ERROR: settings.py not found")
    sys.exit(1)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)
django.setup()

from user_app.models import CustomUser, Relationship

# Stats service has its own PostgreSQL database — we write directly to it
# instead of going through the HTTP API, which is much faster for bulk seeding.
STATS_DB = {
    "host":     os.environ.get("STATS_DB_HOST", "statistics_db"),
    "port":     os.environ.get("STATS_DB_PORT", "5432"),
    "dbname":   os.environ.get("STATS_DB_NAME", "game_stats_db"),
    "user":     os.environ.get("STATS_DB_USER", "bn_user"),
    "password": os.environ.get("STATS_DB_PASS", "bn_pass"),
}

TOTAL_USERS  = 167
DISPLAY_NAMES = ["Caner", "Melis", "Mert", "Selin", "Batuhan",
                 "Emre", "Ayşe", "Mehmet", "Fatma", "Ali"]


def seed_data():
    # -- Clean up previous seed data --
    print("Cleaning up old users and relationships...")
    Relationship.objects.all().delete()
    CustomUser.objects.filter(is_superuser=False).delete()

    # -- Create users --
    print(f"Creating {TOTAL_USERS} users...")
    downloads = Path("/mnt/downloads")
    avatars_dir = Path("/app/media/avatars")
    avatars_dir.mkdir(parents=True, exist_ok=True)

    default_pw = make_password("1")
    users_to_create = []

    for i in range(1, TOTAL_USERS + 1):
        username = f"user{i}"
        display  = DISPLAY_NAMES[(i - 1) % len(DISPLAY_NAMES)]
        if i > 5:
            display = f"{display}_{i}"

        # Copy avatar for the first 5 users if the file exists
        avatar_path = None
        if i <= 5:
            src = downloads / f"download ({i}).jpeg"
            dst = avatars_dir / f"avatar_{username}.jpeg"
            if src.exists():
                shutil.copy(str(src), str(dst))
                avatar_path = f"avatars/avatar_{username}.jpeg"

        users_to_create.append(CustomUser(
            username=username,
            password=default_pw,
            email=f"{username}@example.com",
            display_name=display,
            avatar=avatar_path,
            is_active=True,
        ))

    CustomUser.objects.bulk_create(users_to_create, ignore_conflicts=True)
    users = list(CustomUser.objects.filter(username__startswith="user").order_by("id"))

    # -- Create friendships --
    # Each user gets 2-5 friends based on their position in the list
    print("Creating friendships...")
    rels = []
    for i, u1 in enumerate(users):
        for k in range((i % 4) + 2):
            u2 = users[(i + k + 1) % len(users)]
            a, b = (u1, u2) if u1.id < u2.id else (u2, u1)
            rels.append(Relationship(from_user=a, to_user=b, status="friends"))
    Relationship.objects.bulk_create(rels, ignore_conflicts=True)
    print(f"  {len(rels)} friendships created")

    # -- Generate game history --
    # All data is deterministic so the seed produces the same result every run.
    # We accumulate everything in memory, then do one bulk write to the DB.
    print("Building game history...")

    # player_stats[(user_id, difficulty, mode)] = [username, wins, losses, best_time]
    player_stats = {}
    weekly_stats = {}
    match_rows   = []  # will be bulk-inserted into match_history

    def record(user_id, username, difficulty, mode, result, time_sec=None, opponent=None):
        key = (user_id, difficulty, mode)

        if key not in player_stats:
            player_stats[key] = [username, 0, 0, None]
        ps = player_stats[key]

        if result == "win":
            ps[1] += 1
            if time_sec is not None and (ps[3] is None or time_sec < ps[3]):
                ps[3] = time_sec  # track best (lowest) time
        else:
            ps[2] += 1

        if mode == "online":
            if key not in weekly_stats:
                weekly_stats[key] = [username, 0, 0]
            ws = weekly_stats[key]
            if result == "win":
                ws[1] += 1
            else:
                ws[2] += 1

        match_rows.append((user_id, username, opponent, difficulty, mode, result, time_sec))

    for i, u in enumerate(users):
        # Offline games: each player gets a different number of wins and losses (0-100)
        off_wins   = (i * 13) % 101
        off_losses = (i * 7)  % 101

        for w in range(off_wins):
            record(u.id, u.username, (i + w) % 5 + 1, "offline", "win",
                   90 + (i * 17 + w * 31) % 500)

        for l in range(off_losses):
            record(u.id, u.username, (i + l) % 5 + 1, "offline", "lose")

        # Online games: each player gets a different number of games (0-200)
        # and a different win rate (win_bias 0-99 out of 100).
        # This spreads the leaderboard so no two players have the same score.
        num_games = (i * 37) % 201
        win_bias  = (i * 41) % 100  # higher = wins more often

        for j in range(num_games):
            opp  = users[(i + j + 1) % len(users)]
            diff = (i + j) % 5 + 1
            t    = 90 + (i * 11 + j * 23) % 500

            if (i * 13 + j * 17) % 100 < win_bias:
                winner, loser = u, opp
            else:
                winner, loser = opp, u

            record(winner.id, winner.username, diff, "online", "win",  t,    loser.username)
            record(loser.id,  loser.username,  diff, "online", "lose", None, winner.username)

    # Calculate current win streaks for each player from their online game history
    online_games = defaultdict(list)
    for uid, uname, _, diff, mode, result, _ in match_rows:
        if mode == "online":
            online_games[uid].append((uname, result))

    streaks = {}
    for uid, games in online_games.items():
        streak = 0
        for _, result in reversed(games):
            if result == "win":
                streak += 1
            else:
                break
        streaks[uid] = (games[-1][0], streak)

    # -- Write everything to the stats database in bulk --
    print(f"Writing to stats DB: {len(player_stats)} stat rows, {len(match_rows)} match records...")

    conn = psycopg2.connect(**STATS_DB)
    cur  = conn.cursor()

    cur.execute(
        "TRUNCATE TABLE match_history, player_stats, weekly_player_stats, "
        "online_win_streaks RESTART IDENTITY CASCADE"
    )

    psycopg2.extras.execute_values(cur,
        """INSERT INTO player_stats
               (user_id, difficulty, mode, username, wins, losses, best_time_seconds)
           VALUES %s
           ON CONFLICT (user_id, difficulty, mode) DO UPDATE SET
               wins = EXCLUDED.wins, losses = EXCLUDED.losses,
               best_time_seconds = EXCLUDED.best_time_seconds,
               updated_at = NOW()""",
        [(uid, d, m, un, w, l, bt) for (uid, d, m), (un, w, l, bt) in player_stats.items()],
        page_size=2000,
    )

    psycopg2.extras.execute_values(cur,
        """INSERT INTO weekly_player_stats
               (user_id, difficulty, mode, username, wins, losses)
           VALUES %s
           ON CONFLICT (user_id, difficulty, mode) DO UPDATE SET
               wins = EXCLUDED.wins, losses = EXCLUDED.losses,
               updated_at = NOW()""",
        [(uid, d, m, un, w, l) for (uid, d, m), (un, w, l) in weekly_stats.items()],
        page_size=2000,
    )

    psycopg2.extras.execute_values(cur,
        """INSERT INTO match_history
               (user_id, username, opponent, difficulty, mode, result, time_seconds)
           VALUES %s""",
        match_rows,
        page_size=5000,
    )

    psycopg2.extras.execute_values(cur,
        """INSERT INTO online_win_streaks (user_id, username, current_streak)
           VALUES %s
           ON CONFLICT (user_id) DO UPDATE SET
               username = EXCLUDED.username,
               current_streak = EXCLUDED.current_streak,
               updated_at = NOW()""",
        [(uid, uname, streak) for uid, (uname, streak) in streaks.items()],
        page_size=2000,
    )

    conn.commit()
    cur.close()
    conn.close()
    print("Done.")


if __name__ == "__main__":
    seed_data()