import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.reminders import Reminder


VALID_SCHEDULE_TYPES = ["DEFAULT", "CUSTOM"]

VALID_REPEAT_TYPES = [
    "NONE",
    "WEEKLY",
    "MONTHLY",
    "YEARLY"
]

VALID_PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH"
]


def create_reminder(
        db: Session,
        doc_id: int,
        title: str,
        expiry_date,
        schedule_type: str,
        reminder_at,
        repeat_type: str,
        priority: str,
        notes: str | None,
        enable_push: bool
):

    now = datetime.now(timezone.utc)

    schedule_type = schedule_type.upper()
    repeat_type = repeat_type.upper()
    priority = priority.upper()

    if schedule_type not in VALID_SCHEDULE_TYPES:
        raise HTTPException(400, "Invalid schedule type")

    if repeat_type not in VALID_REPEAT_TYPES:
        raise HTTPException(400, "Invalid repeat type")

    if priority not in VALID_PRIORITIES:
        raise HTTPException(400, "Invalid priority")

    expiry_datetime = datetime.combine(
        expiry_date,
        datetime.min.time(),
        tzinfo=timezone.utc
    )

    if expiry_datetime <= now:
        raise HTTPException(400, "Expiry date must be future")

    if schedule_type == "DEFAULT":

        reminder_at = expiry_datetime - timedelta(days=1)

    if schedule_type == "CUSTOM":

        if reminder_at is None:
            raise HTTPException(400, "Custom reminder requires reminder_at")

        if reminder_at <= now:
            raise HTTPException(400, "Reminder time cannot be past")

        if reminder_at > expiry_datetime:
            raise HTTPException(400, "Reminder cannot be after expiry")

    reminder = Reminder(

        reminder_uuid=str(uuid.uuid4()),

        doc_id=doc_id,

        schedule_type=schedule_type,

        reminder_at=reminder_at,

        push_notification=enable_push,

        reminder_title=title.strip(),

        repeat_type=repeat_type,

        priority=priority,

        notes=notes

    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder