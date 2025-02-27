from .models import Booking, db

def create_booking(user_id, event_id):
    booking = Booking(user_id=user_id, event_id=event_id)
    db.session.add(booking)
    db.session.commit()
    return booking