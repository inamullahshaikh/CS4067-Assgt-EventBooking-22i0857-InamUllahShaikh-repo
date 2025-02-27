from fastapi import FastAPI
from .routes import router

app = FastAPI()

app.include_router(router, prefix="/user", tags=["User Service"])

@app.get("/")
def root():
    return {"message": "User Service is running"}
