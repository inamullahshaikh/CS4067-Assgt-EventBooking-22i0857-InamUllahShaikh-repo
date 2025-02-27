from .models import save_notification

def create_notification(user_id, message):
    notification_id = save_notification(user_id, message)
    return {"notification_id": str(notification_id), "status": "queued"}
