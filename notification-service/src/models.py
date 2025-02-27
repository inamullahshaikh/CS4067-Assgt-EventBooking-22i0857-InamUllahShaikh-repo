from .database import notifications_collection

def save_notification(user_id, message, status="pending"):
    notification = {
        "user_id": user_id,
        "message": message,
        "status": status
    }
    return notifications_collection.insert_one(notification).inserted_id
