from flask import Blueprint, request, jsonify
from .services import create_booking
from .database import db

routes = Blueprint('routes', __name__)

@routes.route('/book', methods=['POST'])
def book_event():
    data = request.json
    booking = create_booking(data['user_id'], data['event_id'])
    return jsonify({"message": "Booking created", "booking_id": booking.id})
