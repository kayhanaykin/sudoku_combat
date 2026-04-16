from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Relationship

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['id', 'intra_id', 'username', 'display_name', 'email', 'get_friend_count', 'is_online', 'is_staff']
    
    # Define which fields to show in the edit screen from our custom model
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile', {'fields': ('display_name', 'intra_id', 'avatar', 'friends')}),
        ('Status', {'fields': ('is_online', 'last_seen')}),
    )

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
