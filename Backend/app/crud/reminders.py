from sqlalchemy.orm import Session
from app.models.reminders import Reminder


def create_reminder(
        db: Session,
        reminder_uuid: str,
        user_id: int,
        doc_id: int,
        title: str,
        expiry_date,
        schedule_type: str,
        reminder_at,
        repeat_type: str,
        priority: str,
        notes: str,
        enable_push: bool
):

    reminder = Reminder(
        reminder_uuid=reminder_uuid,
        user_id=user_id,
        doc_id=doc_id,
        title=title,
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