from app.models.reminders import Reminder
from sqlalchemy.orm import Session
from sqlalchemy import func

def create_reminder(db: Session, reminder_data: dict)->Reminder:
    db_reminder = Reminder(doc_id = reminder_data["doc_id"], schedule_type = reminder_data["schedule_type"], reminder_at = reminder_data["reminder_at"], push_notification = reminder_data["push_notification"], reminder_title = reminder_data["reminder_title"], repeat_type = reminder_data["repeat_type"], priority = reminder_data["priority"], notes = reminder_data["notes"])
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_not_sent_reminder_ids(db: Session):
    window_start = func.now() - func.interval('1 minute')
    reminder_ids = (db.query(Reminder.reminder_id).filter(Reminder.reminder_status == "PENDING", Reminder.reminder_at > window_start, Reminder.reminder_at<=func.now()).all())
    return [r[0] for r in reminder_ids]

def mark_reminders_as_processing(db: Session, reminder_ids: list):
    if not reminder_ids:
        return
    db.query(Reminder).filter(Reminder.reminder_id.in_(reminder_ids)).update({Reminder.reminder_status: "PROCESSING"}, synchronize_session=False)
    db.commit()

def fetch_reminder_details(db: Session, reminder_ids: list):
    if not reminder_ids:
        return {"doc_ids": [], "reminders": []}
    results = (db.query(Reminder.reminder_id, Reminder.doc_id, Reminder.schedule_type, Reminder.reminder_at, Reminder.push_notification, Reminder.reminder_title, Reminder.repeat_type, Reminder.reminder_status)).filter(Reminder.reminder_id.in_(reminder_ids)).all()
    reminders = [{"reminder_id": r.reminder_id, "doc_id": r.doc_id, "schedule_type": r.schedule_type, "reminder_at": r.reminder_at, "push_notification": r.push_notification, "reminder_title": r.reminder_title, "repeat_type": r.repeat_type, "reminder_status": r.reminder_status} for r in results]   
    return reminders