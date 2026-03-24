from app.database import SessionLocal
from app.models.users import User
from app.services.reminder_service import create_reminder_service
import datetime
import pytz
import traceback

db = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        print("NO USER!")
    else:
        print(f"Testing for user {user.user_id}")
        create_reminder_service(
            db=db,
            user_id=user.user_id,
            doc_id=None,
            title="Test Reminder",
            expiry_date=datetime.date(2026, 3, 25),
            schedule_type="DEFAULT",
            reminder_at=None,
            repeat_type="NONE",
            priority="MEDIUM",
            notes=None,
            enable_push=False,
            user_timezone=pytz.timezone("UTC")
        )
        print("Reminder created successfully!")
except Exception as e:
    traceback.print_exc()
finally:
    db.close()
