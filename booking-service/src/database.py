from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/bookingdb")
