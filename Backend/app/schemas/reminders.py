from pydantic import BaseModel
from datetime import datetime

class ReminderData(BaseModel): 
    reminder_title: str
    schedule_type: str
    reminder_at: datetime
    repeat_type: str
    push_notification: bool 
    priority: str
    notes: str    