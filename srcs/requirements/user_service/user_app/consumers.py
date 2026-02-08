import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from channels.db import database_sync_to_async

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.room_group_name = "online_users"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

            # 1. Update DB to Online
            await self.update_user_status(True)

            # 2. Get the list of people who are ALREADY online
            online_user_ids = await self.get_online_users()

            # 3. Send the initial list ONLY to the person who just joined
            await self.send(text_data=json.dumps({
                "type": "initial_status",
                "online_users": online_user_ids
            }))

            # 4. Broadcast to EVERYONE else that I just joined
            await self.broadcast_status("online")
        else:
            await self.close()

    async def receive(self, text_data):
        # This acts as a "Heartbeat". Every 30s the frontend sends {}
        # to keep the last_seen timestamp fresh.
        await self.update_user_status(True)

    # ... keep your disconnect and broadcast_status methods ...

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # 1. Update DB to Offline
            await self.update_user_status(False)
            
            # 2. Shout to others
            await self.broadcast_status("offline")
            
            # 3. Leave group
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def broadcast_status(self, status):
        """Helper to send message to the whole group"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_update", # This matches the method name below
                "user_id": self.user.id,
                "status": status
            }
        )

    async def user_update(self, event):
        """Sends data to the browser"""
        await self.send(text_data=json.dumps({
            'user_id': event['user_id'],
            'status': event['status']
        }))

    @database_sync_to_async
    def update_user_status(self, is_online):
        from .models import CustomUser
        # We MUST update the 'is_online' field specifically
        CustomUser.objects.filter(pk=self.user.pk).update(
            is_online=is_online, 
            last_seen=timezone.now()
        )

    @database_sync_to_async
    def get_online_users(self):
        from .models import CustomUser
        # Return list of IDs of users where is_online is True
        return list(CustomUser.objects.filter(is_online=True).values_list('id', flat=True))