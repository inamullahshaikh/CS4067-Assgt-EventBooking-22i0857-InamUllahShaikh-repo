import pika
import json
from .services import create_notification

def callback(ch, method, properties, body):
    data = json.loads(body)
    create_notification(data['user_id'], data['message'])
    print("Notification processed:", data)

def setup_rabbitmq():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='notification_queue')
    channel.basic_consume(queue='notification_queue', on_message_callback=callback, auto_ack=True)
    print("Waiting for messages...")
    channel.start_consuming()
