from fastapi import FastAPI, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

# MongoDB Connection
MONGO_URI = "mongodb://mongodb:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["user_service_db"]
users_collection = db["users"]

# JWT Configuration
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashing & Token Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# FastAPI App
app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None

class MatchPasswordRequest(BaseModel):
    user_id: str
    password: str

# User Registration
@app.post("/register/")
async def register_user(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = {
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    new_user = await users_collection.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(new_user.inserted_id)}

# User Login
@app.post("/login/")
async def login_user(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": str(db_user["_id"])}

# Update User Details
@app.put("/update/")
async def update_user(user_id: str, update_data: UserUpdate):
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    update_fields = {}
    if update_data.name:
        update_fields["name"] = update_data.name
    if update_data.email:
        existing_email = await users_collection.find_one({"email": update_data.email})
        if existing_email and existing_email["_id"] != obj_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_fields["email"] = update_data.email
    if update_data.password:
        update_fields["password_hash"] = hash_password(update_data.password)
    update_fields["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one({"_id": obj_id}, {"$set": update_fields})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")
    
    return {"message": "User details updated successfully"}

# Match Password
@app.post("/match-password/")
async def match_password(request: MatchPasswordRequest):
    try:
        obj_id = ObjectId(request.user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    db_user = await users_collection.find_one({"_id": obj_id})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"match": verify_password(request.password, db_user["password_hash"])}

# Get User by ID
@app.get("/get-user/")
async def get_user(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    db_user = await users_collection.find_one({"_id": obj_id})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user_id": str(db_user["_id"]), "name": db_user["name"], "email": db_user["email"]}