from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReminderResponse(BaseModel):

    reminder_uuid: str

    title: str

    expiry_date: datetime

    reminder_at: datetime

    schedule_type: str

    repeat_type: str

    priority: str

    enable_push: bool

    notes: Optional[str]

    class Config:
        from_attributes = True