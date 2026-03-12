import uuid
from datetime import datetime, timedelta, time
from fastapi import HTTPException
from sqlalchemy.orm import Session
import pytz

from app.crud.reminders import create_reminder as crud_create_reminder


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


def create_reminder_service(
    db: Session,
    doc_id: int,
    title: str,
    expiry_date,
    schedule_type: str,
    reminder_at,
    repeat_type: str,
    priority: str,
    notes: str | None,
    enable_push: bool,
    user_timezone
):

    now = datetime.utcnow().replace(tzinfo=pytz.UTC)

    schedule_type = schedule_type.upper()
    repeat_type = repeat_type.upper()
    priority = priority.upper()

    if schedule_type not in VALID_SCHEDULE_TYPES:
        raise HTTPException(400, "Invalid schedule type")

    if repeat_type not in VALID_REPEAT_TYPES:
        raise HTTPException(400, "Invalid repeat type")

    if priority not in VALID_PRIORITIES:
        raise HTTPException(400, "Invalid priority")

    expiry_local = datetime.combine(expiry_date, time(9, 0))
    expiry_local = user_timezone.localize(expiry_local)

    expiry_utc = expiry_local.astimezone(pytz.UTC)

    if expiry_utc <= now:
        raise HTTPException(400, "Expiry must be future")

    if schedule_type == "DEFAULT":

        reminder_local = expiry_local - timedelta(days=1)

        reminder_utc = reminder_local.astimezone(pytz.UTC)

    else:

        if reminder_at is None:
            raise HTTPException(400, "Custom reminder required")

        reminder_utc = reminder_at

        if reminder_utc <= now:
            raise HTTPException(400, "Reminder cannot be past")

        if reminder_utc > expiry_utc:
            raise HTTPException(400, "Reminder cannot be after expiry")

    reminder_uuid = str(uuid.uuid4())

    reminder = crud_create_reminder(
        db=db,
        reminder_uuid=reminder_uuid,
        doc_id=doc_id,
        schedule_type=schedule_type,
        reminder_at=reminder_utc,
        reminder_title=title.strip(),
        repeat_type=repeat_type,
        priority=priority,
        notes=notes,
        enable_push=enable_push
    )

    return reminder