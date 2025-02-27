from flask import Flask
from .routes import routes
from .database import db

app = Flask(__name__)
app.register_blueprint(routes)

@app.route('/')
def home():
    return {"message": "Notification Service Running"}

if __name__ == '__main__':
    app.run(debug=True, port=5004)
