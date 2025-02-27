# Notification Service

This service handles user notifications using MongoDB and RabbitMQ.

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Start RabbitMQ and MongoDB
3. Run the service: `python src/app.py`

## Endpoints

- `POST /notify` - Send a notification

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `RABBITMQ_URL` - RabbitMQ connection string
- `SMTP_SERVER` - SMTP server for emails
