from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReminderResponse(BaseModel):

    reminder_uuid: str
    reminder_title: str
    reminder_at: datetime
    schedule_type: str
    repeat_type: str
    priority: str
    push_notification: bool
    notes: Optional[str]

    class Config:
        from_attributes = True