from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from main import app
from app.services.scheduler_service import check_and_send_notifications
from fastapi import FastAPI
from contextlib import asynccontextmanager

scheduler = AsyncIOScheduler()

def run_scheduler_job():
    print("Scheduler running...")
    db = SessionLocal()
    try:
        check_and_send_notifications(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):

    scheduler.add_job(run_scheduler_job, "interval", seconds=30)
    scheduler.start()
    print("Scheduler started.")

    yield

    scheduler.shutdown()
    print ("Scheduler stopped.")

app = FastAPI(lifespan=lifespan)