from apscheduler.schedulers.asyncio import AsyncIOScheduler
from main import app
from app.services.scheduler_service import check_and_send_notifications

scheduler = AsyncIOScheduler()

@app.lifespan("startup")
def start_scheduler():
    scheduler.add_job(check_and_send_notifications, 'interval', minutes=1)
    scheduler.start()
    print("Scheduler started.")