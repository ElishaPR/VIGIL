from __future__ import annotations
from sqlalchemy.orm import Session
from app.modules.user.models.reminders import Reminder


def create_reminder(
    db: Session,
    reminder_uuid: str,
    user_id: int,
    doc_id: int | None,
    schedule_type: str,
    reminder_at,
    reminder_title: str,
    repeat_type: str,
    priority: str,
    notes: str | None,
    enable_push: bool,
    email_notification: bool = True
):
    reminder = Reminder(
        reminder_uuid=reminder_uuid,
        user_id=user_id,
        doc_id=doc_id,
        schedule_type=schedule_type,
        reminder_at=reminder_at,
        reminder_title=reminder_title,
        repeat_type=repeat_type,
        priority=priority,
        notes=notes,
        push_notification=enable_push,
        email_notification=email_notification
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder


def get_reminder_by_uuid(db: Session, reminder_uuid: str):

    return db.query(Reminder).filter(
        Reminder.reminder_uuid == reminder_uuid
    ).first()


def update_reminder(db: Session, reminder: Reminder):

    db.commit()
    db.refresh(reminder)

    return reminder


def delete_reminder(db: Session, reminder: Reminder):

    db.delete(reminder)
    db.commit()