from app.crud.reminders import create_reminder
from sqlalchemy.orm import Session
from app.schemas.reminder_requests import CreateReminderData
from app.models.reminders import Reminder

def handle_reminder(db: Session, request_data: CreateReminderData, doc_id:int)->Reminder:
    reminder_data = {"doc_id": doc_id,"schedule_type": request_data.reminder.schedule_type, "reminder_at": request_data.reminder.reminder_at, "push_notification": request_data.reminder.push_notification, "reminder_title": request_data.reminder.reminder_title, "repeat_type": request_data.reminder.repeat_type, "priority": request_data.reminder.priority, "notes": request_data.reminder.notes}
    reminder = create_reminder(db, reminder_data)
    return reminder
