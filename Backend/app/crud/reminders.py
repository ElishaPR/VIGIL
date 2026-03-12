from sqlalchemy.orm import Session
from app.models.reminders import Reminder


def create_reminder(
    db: Session,
    reminder_uuid: str,
    doc_id: int,
    schedule_type: str,
    reminder_at,
    reminder_title: str,
    repeat_type: str,
    priority: str,
    notes: str | None,
    enable_push: bool
):

    reminder = Reminder(
        reminder_uuid=reminder_uuid,
        doc_id=doc_id,
        schedule_type=schedule_type,
        reminder_at=reminder_at,
        reminder_title=reminder_title,
        repeat_type=repeat_type,
        priority=priority,
        notes=notes,
        push_notification=enable_push
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder