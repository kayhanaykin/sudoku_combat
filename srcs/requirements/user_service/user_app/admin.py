from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Relationship

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['id', 'intra_id', 'username', 'display_name', 'email', 'get_friend_count', 'is_online', 'is_staff', 'get_password_hash', 'get_avatar_path']
    readonly_fields = ('get_password_hash',)
    
    # Define which fields to show in the edit screen from our custom model
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile', {'fields': ('display_name', 'intra_id', 'avatar', 'friends')}),
        ('Status', {'fields': ('is_online', 'last_seen')}),
        ('Raw Password Data', {'fields': ('get_password_hash',)}),
    )

    def get_password_hash(self, obj):
        # Django stores the algorithm, iterations, salt, and hash together in the password field
        return obj.password
    get_password_hash.short_description = 'Password Hash & Salt'

    def get_avatar_path(self, obj):
        return obj.avatar.name if obj.avatar else "No Avatar"
    get_avatar_path.short_description = 'Avatar Path'

    def get_friend_count(self, obj):
        # Calculate friend count from your Relationship model
        from django.db.models import Q
        return Relationship.objects.filter(
            Q(status='friends') & (Q(from_user=obj) | Q(to_user=obj))
        ).count()
    get_friend_count.short_description = 'Friends'

class RelationshipAdmin(admin.ModelAdmin):
    list_display = ['id', 'from_user', 'to_user', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['from_user__username', 'to_user__username']

# Register the models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Relationship, RelationshipAdmin)
