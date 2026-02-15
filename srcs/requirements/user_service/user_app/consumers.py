import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.room_group_name = "online_users"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            
            await self.update_user_status(True)

            online_user_ids = await self.get_online_users()

            if self.user.id not in online_user_ids:
                online_user_ids.append(self.user.id)

            await self.send(text_data=json.dumps({
                "type": "initial_status",
                "online_users": online_user_ids
            }))

            await self.broadcast_status("online")
            print(f"✅ WS Connected: {self.user.username} (ID: {self.user.id})")
        else:
            print("❌ WS Auth Failed")
            await self.close(code=4003)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.update_user_status(False)
            await self.broadcast_status("offline")
            
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'heartbeat':
                await self.update_user_status(True)
        except:
            pass

    async def broadcast_status(self, status):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_update",
                "user_id": self.user.id,
                "status": status
            }
        )

    async def user_update(self, event):
        await self.send(text_data=json.dumps({
            'user_id': event['user_id'],
            'status': event['status']
        }))

    @database_sync_to_async
    def update_user_status(self, is_online):
        User = get_user_model()
        User.objects.filter(pk=self.user.pk).update(
            is_online=is_online, 
            last_seen=timezone.now()
        )

    @database_sync_to_async
    def get_online_users(self):
        User = get_user_model()
        return list(User.objects.filter(is_online=True).values_list('id', flat=True))