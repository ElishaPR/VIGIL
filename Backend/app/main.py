from fastapi import FastAPI
import os
import app.core.firebase_config
from app.modules.user.routers import users, email_verification, password_reset, reminders, fcm_router, documents, feedback, reports as user_reports
from app.modules.admin.routers import admin, reports as admin_reports
from fastapi.middleware.cors import CORSMiddleware
from app.modules.user.scheduler.scheduler import lifespan

app = FastAPI(
    title="Vigil API",
    docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",  # Hide docs in production
    redoc_url=None if os.getenv("ENVIRONMENT") == "production" else "/redoc",  # Also hide ReDoc if used
    openapi_url=None if os.getenv("ENVIRONMENT") == "production" else "/openapi.json",
    lifespan=lifespan  # Hide schema
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(email_verification.router)
app.include_router(password_reset.router)
app.include_router(reminders.router)
app.include_router(fcm_router.router)
app.include_router(documents.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(user_reports.router)
app.include_router(admin_reports.router)

@app.get("/")
def root():
    return {"message": "Vigil Backend"}