from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/notificationdb")
client = MongoClient(MONGO_URI)
db = client.notificationdb
notifications_collection = db.notifications
