from sqlalchemy.orm import Session
from app.crud.reminders import get_not_sent_reminder_ids, mark_reminders_as_processing

def check_and_send_notifications(db: Session):
    reminder_ids = get_not_sent_reminder_ids(db)
    mark_reminders_as_processing(db, reminder_ids)
    