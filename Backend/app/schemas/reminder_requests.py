from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class AddReminderRequest(BaseModel):

    category: str = Field(min_length=1, max_length=50)

    title: str = Field(min_length=3, max_length=100)

    expiry_date: datetime

    schedule_type: str

    reminder_at: Optional[datetime] = None

    repeat_type: str

    priority: str

    enable_push: bool = False

    notes: Optional[str] = Field(default=None, max_length=500)