from flask import Blueprint, request, jsonify
from .services import create_notification

routes = Blueprint('routes', __name__)

@routes.route('/notify', methods=['POST'])
def send_notification():
    data = request.json
    result = create_notification(data['user_id'], data['message'])
    return jsonify(result)
