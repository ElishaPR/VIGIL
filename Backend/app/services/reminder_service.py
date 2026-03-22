import uuid
from datetime import datetime, timedelta, time
from fastapi import HTTPException
from sqlalchemy.orm import Session
import pytz
from app.models.reminders import Reminder
from app.crud.reminders import create_reminder as crud_create_reminder, get_reminder_by_uuid, update_reminder, delete_reminder
DEFAULT_REMINDER_HOUR = 9
DEFAULT_REMINDER_MINUTE = 0

def get_now_utc():
    return datetime.now(pytz.UTC)


def get_default_time_local(user_timezone, target_date):
    local_dt = datetime.combine(
        target_date,
        time(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE)
    )
    return user_timezone.localize(local_dt)


def adjust_if_today_past(reminder_local, user_timezone):
    now_local = datetime.now(user_timezone)

    if reminder_local.date() == now_local.date() and reminder_local <= now_local:
        # move to next 5 minutes
        adjusted = now_local + timedelta(minutes=5)
        return adjusted

    return reminder_local


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
    user_id: int,
    doc_id: int | None,
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

    now_utc = datetime.now(pytz.UTC)

    schedule_type = schedule_type.upper()
    repeat_type = repeat_type.upper()
    priority = priority.upper()

    # -------- VALIDATIONS --------
    if schedule_type not in VALID_SCHEDULE_TYPES:
        raise HTTPException(400, "Invalid schedule type")

    if repeat_type not in VALID_REPEAT_TYPES:
        raise HTTPException(400, "Invalid repeat type")

    if priority not in VALID_PRIORITIES:
        raise HTTPException(400, "Invalid priority")

    # -------- EXPIRY --------
    expiry_local = datetime.combine(
        expiry_date,
        time(9, 0)
    )
    expiry_local = user_timezone.localize(expiry_local)
    expiry_utc = expiry_local.astimezone(pytz.UTC)

    # -------- DEFAULT LOGIC FIX --------
    if schedule_type == "DEFAULT":

        today_local = datetime.now(user_timezone).date()

        if expiry_date == today_local:
            reminder_local = datetime.now(user_timezone) + timedelta(minutes=2)
        else:
            reminder_local = expiry_local - timedelta(days=1)

        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)

    else:
        if not reminder_at:
            raise HTTPException(400, "Custom reminder required")

        reminder_local = reminder_at.astimezone(user_timezone)
        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)

    if reminder_utc <= now_utc:
        raise HTTPException(400, "Reminder still in past")

    reminder = crud_create_reminder(
        db=db,
        reminder_uuid=str(uuid.uuid4()),
        user_id=user_id,
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


def update_reminder_service(
    db,
    reminder_uuid,
    user_id,
    schedule_type,
    reminder_at,
    repeat_type,
    priority,
    notes,
    enable_push
):

    reminder = db.query(Reminder).filter(
        Reminder.reminder_uuid == reminder_uuid,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(404, "Reminder not found")

    if reminder_at:
        reminder.reminder_at = reminder_at.astimezone(pytz.UTC)

    if schedule_type:
        reminder.schedule_type = schedule_type.upper()

    if repeat_type:
        reminder.repeat_type = repeat_type.upper()

    if priority:
        reminder.priority = priority.upper()

    reminder.notes = notes
    reminder.push_notification = enable_push

    return update_reminder(db, reminder)

def delete_reminder_service(db, reminder_uuid, user_id):

    reminder = db.query(Reminder).filter(
        Reminder.reminder_uuid == reminder_uuid,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(404, "Reminder not found")

    delete_reminder(db, reminder)

def get_reminder_by_uuid_service(db, reminder_uuid, user_id):
    from app.models.reminders import Reminder

    reminder = (
        db.query(Reminder)
        .filter(
            Reminder.reminder_uuid == reminder_uuid,
            Reminder.user_id == user_id
        )
        .first()
    )

    if not reminder:
        raise Exception("Reminder not found")

    return reminder