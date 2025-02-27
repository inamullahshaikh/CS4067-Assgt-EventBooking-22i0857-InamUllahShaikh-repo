from flask import Flask
from .routes import routes
from .database import db, DATABASE_URL

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.register_blueprint(routes)

db.init_app(app)

@app.route('/')
def home():
    return {"message": "Booking Service Running"}

if __name__ == '__main__':
    app.run(debug=True, port=5003)
