# Booking Service

This service handles event bookings and communicates with RabbitMQ and PostgreSQL.

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Run the service: `python src/app.py`
3. Ensure RabbitMQ and PostgreSQL are running.

### Endpoints

- `POST /book` - Create a new booking

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
