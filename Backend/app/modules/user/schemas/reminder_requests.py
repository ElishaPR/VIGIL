from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from fastapi import Form


class AddReminderRequest(BaseModel):
    category: Optional[str] = Field(default=None, max_length=25)
    title: str = Field(..., min_length=3, max_length=100)
    expiry_date: str
    schedule_type: str
    repeat_type: str
    priority: str
    enable_push: bool
    reminder_at: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    timezone: str = "UTC"
    doc_uuid: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        category: str = Form(None),
        title: str = Form(...),
        expiry_date: str = Form(...),
        schedule_type: str = Form(...),
        repeat_type: str = Form(...),
        priority: str = Form(...),
        enable_push: bool = Form(...),
        reminder_at: Optional[str] = Form(None),
        notes: Optional[str] = Form(None),
        timezone: str = Form("UTC"),
        doc_uuid: Optional[str] = Form(None),
    ):
        return cls(
            category=category,
            title=title,
            expiry_date=expiry_date,
            schedule_type=schedule_type,
            repeat_type=repeat_type,
            priority=priority,
            enable_push=enable_push,
            reminder_at=reminder_at,
            notes=notes,
            timezone=timezone,
            doc_uuid=doc_uuid
        )