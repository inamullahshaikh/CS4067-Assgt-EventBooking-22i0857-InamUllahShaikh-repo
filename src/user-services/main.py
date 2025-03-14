from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, User
from auth import hash_password, verify_password, create_access_token
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],  # Allow frontend requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str = None
    email: str = None
    password: str = None

class MatchPasswordRequest(BaseModel):
    user_id: int
    password: str

# User Registration
@app.post("/register/", status_code=200)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

# User Login
@app.post("/login/")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": db_user.id}

# Update User Details
@app.put("/update/")
def update_user(user_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields if provided
    if update_data.name is not None:
        db_user.name = update_data.name
    if update_data.email is not None:
        existing_email = db.query(User).filter(User.email == update_data.email).first()
        if existing_email and existing_email.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        db_user.email = update_data.email
    if update_data.password is not None:
        db_user.password_hash = hash_password(update_data.password)

    db.commit()
    db.refresh(db_user)  # Refresh to get updated data

    return {"message": "User details updated successfully"}

# ✅ New API Call: Match Password
@app.post("/match-password/")
def match_password(request: MatchPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == request.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(request.password, db_user.password_hash):
        return {"match": True}
    else:
        return {"match": False}

# ✅ New API Call: Get User by ID
@app.get("/get-user/")
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": db_user.id,
        "name": db_user.name,
        "email": db_user.email
    }
