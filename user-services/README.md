# **User Service (FastAPI + PostgreSQL)**

## **Overview**

The **User Service** is a microservice responsible for user authentication and profile management. It provides REST API endpoints for user registration and authentication. It is built using **FastAPI**, **PostgreSQL**, and follows **modern API best practices**.

## **Features**

✅ User Registration  
✅ User Authentication (Login)  
✅ Password Hashing using `bcrypt`  
✅ Secure Database Storage with **PostgreSQL**  
✅ API Documentation with **Swagger UI**  
✅ Lightweight and High-Performance with **FastAPI**

---

## **Project Structure**

```
user-service/
├── src/
│   ├── main.py       # FastAPI app entry point
│   ├── models.py     # Database models (User)
│   ├── routes.py     # API endpoints
│   ├── services.py   # Business logic (User Authentication)
│   ├── database.py   # PostgreSQL connection setup
│   ├── utils.py      # Utility functions
├── .env              # Environment variables
├── requirements.txt  # Dependencies
├── Dockerfile        # Containerization with Docker
├── README.md         # Documentation
```

---

## **1️⃣ Prerequisites**

Before running the service, ensure you have the following installed:

- 🐍 **Python 3.9+**
- 🐘 **PostgreSQL 12+**
- 🐳 **Docker** (Optional for containerization)

---

## **2️⃣ Setup and Installation**

### **🔹 Clone the Repository**

```sh
git clone https://github.com/your-username/event-booking-microservices.git
cd event-booking-microservices/user-service
```

### **🔹 Create and Activate a Virtual Environment**

```sh
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows
```

### **🔹 Install Dependencies**

```sh
pip install -r requirements.txt
```

### **🔹 Configure Environment Variables**

Create a `.env` file in the **root directory** and add:

```
DATABASE_URL=postgresql://your_user:your_password@localhost/userdb
SECRET_KEY=supersecretkey
```

### **🔹 Setup PostgreSQL Database**

1. Open **PostgreSQL terminal** and run:

```sql
CREATE DATABASE userdb;
```

2. Check if the database is created:

```sql
\l
```

---

## **3️⃣ Running the Service**

### **🔹 Using Uvicorn (Locally)**

```sh
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Your API will be running at **`http://127.0.0.1:8000`**

### **🔹 Running with Docker**

1. **Build the Docker Image**

```sh
docker build -t user-service .
```

2. **Run the Docker Container**

```sh
docker run -p 8000:8000 --env-file .env user-service
```

---

## **4️⃣ API Endpoints**

You can access the **API documentation** at:  
📜 **Swagger UI:** `http://127.0.0.1:8000/docs`  
📜 **ReDoc:** `http://127.0.0.1:8000/redoc`

### **🔹 Register User**

**Endpoint:** `POST /user/register`  
**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

---

### **🔹 Login User**

**Endpoint:** `POST /user/login`  
**Request Body:**

```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": "john_doe"
}
```

---

## **5️⃣ Testing the API**

You can use **Postman** or **cURL** for testing.

**Test Registration with cURL:**

```sh
curl -X 'POST' 'http://127.0.0.1:8000/user/register' \
     -H 'Content-Type: application/json' \
     -d '{"username": "testuser", "email": "test@example.com", "password": "mypassword"}'
```

**Test Login with cURL:**

```sh
curl -X 'POST' 'http://127.0.0.1:8000/user/login' \
     -H 'Content-Type: application/json' \
     -d '{"username": "testuser", "password": "mypassword"}'
```

---

## **6️⃣ Deployment Guide**

- **For Production:** Use `gunicorn` with Uvicorn

```sh
gunicorn -k uvicorn.workers.UvicornWorker src.main:app
```

- **For Cloud Deployment:** Use **AWS, Google Cloud, or Docker Compose**

---

## **7️⃣ Logging & Error Handling**

✅ All errors are logged and handled gracefully.  
✅ Consistent HTTP status codes are returned.

---

## **8️⃣ Contribution Guidelines**

🔹 Fork the repository  
🔹 Create a feature branch (`git checkout -b feature-name`)  
🔹 Commit your changes (`git commit -m "Added new feature"`)  
🔹 Push to the branch (`git push origin feature-name`)  
🔹 Open a **Pull Request**

---

## **9️⃣ License**

📝 This project is licensed under the **MIT License**.

---

## **🔟 Contact**

For any issues or queries, contact **Your Name**:  
📧 **your-email@example.com**  
📂 **GitHub:** [your-github-profile](https://github.com/your-username)

---

This **README** is now professional, structured, and easy to understand. Let me know if you need any modifications! 🚀
