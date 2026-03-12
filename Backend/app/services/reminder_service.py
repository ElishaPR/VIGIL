import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.reminders import Reminder


VALID_SCHEDULE_TYPES = ["default", "custom"]

VALID_REPEAT_TYPES = [
    "none",
    "weekly",
    "monthly",
    "yearly"
]

VALID_PRIORITIES = [
    "low",
    "medium",
    "high"
]


def create_reminder(
        db: Session,
        user_id: int,
        doc_id: int,
        title: str,
        expiry_date: datetime,
        schedule_type: str,
        reminder_at: datetime | None,
        repeat_type: str,
        priority: str,
        notes: str | None,
        enable_push: bool
):

    now = datetime.now(timezone.utc)

    if expiry_date <= now:
        raise HTTPException(
            status_code=400,
            detail="Expiry date must be future"
        )

    if schedule_type not in VALID_SCHEDULE_TYPES:
        raise HTTPException(400, "Invalid schedule type")

    if repeat_type not in VALID_REPEAT_TYPES:
        raise HTTPException(400, "Invalid repeat type")

    if priority not in VALID_PRIORITIES:
        raise HTTPException(400, "Invalid priority")

    if schedule_type == "default":
        reminder_at = expiry_date - timedelta(days=1)

    if schedule_type == "custom":

        if reminder_at is None:
            raise HTTPException(
                status_code=400,
                detail="Custom reminder requires reminderAt"
            )

        if reminder_at > expiry_date:
            raise HTTPException(
                status_code=400,
                detail="Reminder cannot be after expiry"
            )

    reminder = Reminder(
        reminder_uuid=str(uuid.uuid4()),
        user_id=user_id,
        doc_id=doc_id,
        title=title.strip(),
        expiry_date=expiry_date,
        schedule_type=schedule_type,
        reminder_at=reminder_at,
        repeat_type=repeat_type,
        priority=priority,
        notes=notes,
        enable_push=enable_push
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder