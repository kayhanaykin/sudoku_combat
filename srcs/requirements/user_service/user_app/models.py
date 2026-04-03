from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    # 42 Intra Data
    intra_id = models.IntegerField(unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=50, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Social Features (Friends & Status)
    # last_seen tracks the exact moment of the last WebSocket pulse or request
    last_seen = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)

    def __str__(self):
        return f"{self.username} ({self.display_name})"

    @property
    def status(self):
        """
        Returns 'online' if the boolean is True AND the user has been seen 
        within the last 60 seconds (prevents ghost-online status).
        """
        if self.is_online and self.last_seen:
            now = timezone.now()
            if self.last_seen > now - timezone.timedelta(seconds=60):
                return "online"
        return "offline"


class Relationship(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('friends', 'Friends')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')


# Achievement Definitions
ACHIEVEMENT_TYPES = {
    'first_win_online': {'name': 'First Win', 'icon': '🥇'},
    'speedster_easy': {'name': 'Speedster - Easy', 'icon': '⚡'},
    'speedster_medium': {'name': 'Speedster - Medium', 'icon': '⚡'},
    'speedster_hard': {'name': 'Speedster - Hard', 'icon': '⚡'},
    'speedster_expert': {'name': 'Speedster - Expert', 'icon': '⚡'},
    'speedster_extreme': {'name': 'Speedster - Extreme', 'icon': '⚡'},
    'on_fire_5x': {'name': 'On Fire - 5x', 'icon': '🔥'},
    'on_fire_10x': {'name': 'On Fire - 10x', 'icon': '🔥'},
    'on_fire_25x': {'name': 'On Fire - 25x', 'icon': '🔥'},
    'graduate_offline': {'name': 'Graduate - Offline', 'icon': '🎓'},
    'graduate_online': {'name': 'Graduate - Online', 'icon': '🎓'},
    'star': {'name': 'Star', 'icon': '⭐'},
    'king_easy': {'name': 'King - Easy', 'icon': '👑'},
    'king_medium': {'name': 'King - Medium', 'icon': '👑'},
    'king_hard': {'name': 'King - Hard', 'icon': '👑'},
    'king_expert': {'name': 'King - Expert', 'icon': '👑'},
    'king_extreme': {'name': 'King - Extreme', 'icon': '👑'},
}


class Achievement(models.Model):
    """User Achievement Model"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=50, choices=[(k, v['name']) for k, v in ACHIEVEMENT_TYPES.items()])
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    description = models.TextField()
    earned_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0)
    target = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'achievement_type')
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class LeaderboardResetSchedule(models.Model):
    """Track leaderboard reset schedule - Weekly reset every Sunday"""
    difficulty = models.CharField(
        max_length=20,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard'), 
                 ('expert', 'Expert'), ('extreme', 'Extreme')],
        unique=True
    )
    last_reset = models.DateTimeField(auto_now=True)
    next_reset = models.DateTimeField()
    previous_champion = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.difficulty} - Next reset: {self.next_reset}"
