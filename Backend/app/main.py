from fastapi import FastAPI
import os
import app.firebase_config
from app.routers import users, email_verification, password_reset, reminders, fcm_router
from fastapi.middleware.cors import CORSMiddleware
# from app.scheduler.scheduler import lifespan

app = FastAPI(
    title="Vigil API",
    docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",  # Hide docs in production
    redoc_url=None if os.getenv("ENVIRONMENT") == "production" else "/redoc",  # Also hide ReDoc if used
    openapi_url=None if os.getenv("ENVIRONMENT") == "production" else "/openapi.json",
    # lifespan=lifespan  # Hide schema
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(email_verification.router)
app.include_router(password_reset.router)
app.include_router(reminders.router)
app.include_router(fcm_router.router)
@app.get("/")
def root():
    return {"message": "Vigil Backend"}