from pydantic import BaseModel, ConfigDict
from app.schemas.reminders import ReminderData
from app.schemas.documents import DocumentData

class CreateReminderData(BaseModel):
    reminder: ReminderData
    document: DocumentData

class CreateReminderUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reminder_uuid: str
    doc_uuid: str
    reminder_title: str
    doc_title: str 
    doc_category: str
    schedule_type: str
    expiry_date: str
    reminder_at: str
    repeat_type: str
    push_notification: bool
    priority: str
    notes: str
    message: str = "Reminder created successfully!" 