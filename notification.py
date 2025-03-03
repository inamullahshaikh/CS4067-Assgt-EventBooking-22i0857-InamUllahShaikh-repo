import requests
import json
import psycopg2
import pymongo
import pika
import sys

def get_notifications():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["notificationsdb"]
    collection = db["notifications"]
    notifications = collection.find()
    for notification in notifications:
        print(notification)

def check_rabbitmq():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    method_frame, header_frame, body = channel.basic_get("notificationQueue")
    if method_frame:
        print("Pending message:", body.decode())
    else:
        print("No pending messages.")
    connection.close()

def trigger_notification(user_id, event_id):
    conn = psycopg2.connect(
        dbname="booking_db", user="postgres", password="1234", host="localhost", port="5432"
    )
    cur = conn.cursor()
    cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    if not user:
        print("User not found!")
        return
    email = user[0]
    
    message = json.dumps({
        "type": "booking_confirmation",
        "booking": {"id": 999, "user_id": user_id, "event_id": event_id}
    })
    
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.basic_publish(exchange='', routing_key='notificationQueue', body=message)
    print("Notification triggered!")
    connection.close()

def menu():
    while True:
        print("\nNotification Service CLI")
        print("1. View Stored Notifications")
        print("2. Check Pending Messages in RabbitMQ")
        print("3. Trigger Notification")
        print("4. Exit")
        choice = input("Choose an option: ")
        
        if choice == "1":
            get_notifications()
        elif choice == "2":
            check_rabbitmq()
        elif choice == "3":
            user_id = input("Enter User ID: ")
            event_id = input("Enter Event ID: ")
            trigger_notification(user_id, event_id)
        elif choice == "4":
            sys.exit()
        else:
            print("Invalid choice!")

if __name__ == "__main__":
    menu()
