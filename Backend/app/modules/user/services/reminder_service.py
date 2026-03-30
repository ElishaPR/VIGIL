from __future__ import annotations
import uuid
from datetime import datetime, timedelta, time
from fastapi import HTTPException
from sqlalchemy.orm import Session
import pytz

from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document
from app.modules.user.crud.reminders import (
    create_reminder as crud_create_reminder,
    get_reminder_by_uuid,
    update_reminder,
    delete_reminder
)

DEFAULT_REMINDER_HOUR = 9
DEFAULT_REMINDER_MINUTE = 0

VALID_SCHEDULE_TYPES = ["DEFAULT", "CUSTOM"]
VALID_REPEAT_TYPES = ["NONE", "WEEKLY", "MONTHLY", "YEARLY"]
VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"]


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
        adjusted = now_local + timedelta(minutes=5)
        return adjusted

    return reminder_local


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
    # -------- VALIDATIONS --------
    if not title or len(title.strip()) < 3:
        raise HTTPException(400, "Reminder title must be at least 3 characters")

    now_utc = datetime.now(pytz.UTC)
    schedule_type = schedule_type.upper()
    repeat_type = repeat_type.upper()
    priority = priority.upper()

    if schedule_type not in VALID_SCHEDULE_TYPES:
        raise HTTPException(400, "Invalid schedule type")

    if repeat_type not in VALID_REPEAT_TYPES:
        raise HTTPException(400, "Invalid repeat type")

    if priority not in VALID_PRIORITIES:
        raise HTTPException(400, "Invalid priority")

    # -------- EXPIRY --------
    expiry_local = datetime.combine(expiry_date, time(9, 0))
    expiry_local = user_timezone.localize(expiry_local)
    expiry_utc = expiry_local.astimezone(pytz.UTC)

    # -------- REMINDER TIME LOGIC --------
    if schedule_type == "DEFAULT":
        today_local = datetime.now(user_timezone).date()

        if expiry_date == today_local:
            reminder_local = datetime.now(user_timezone) + timedelta(minutes=2)
        else:
            reminder_local = expiry_local - timedelta(days=1)

        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)

    else:  # CUSTOM
        if not reminder_at:
            raise HTTPException(400, "Custom reminder date is required")

        reminder_local = reminder_at.astimezone(user_timezone)
        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)

    if reminder_utc <= now_utc:
        raise HTTPException(400, "Reminder time is in the past")

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
        enable_push=enable_push,
        email_notification=True   # always on by default
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
    notes: str | None,
    push_notification: bool,
    email_notification: bool = True,
    reminder_title: str | None = None,
    category: str | None = None,
    expiry_date=None,
    expiry_date_provided: bool = False,
    user_timezone=pytz.UTC,
    new_doc_id: int | None = None,
    remove_document: bool = False,
    document_title: str | None = None
):
    reminder = db.query(Reminder).filter(
        Reminder.reminder_uuid == reminder_uuid,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(404, "Reminder not found")

    if reminder_title and reminder_title.strip():
        reminder.reminder_title = reminder_title.strip()

    if schedule_type:
        st = schedule_type.upper()
        if st not in VALID_SCHEDULE_TYPES:
            raise HTTPException(400, "Invalid schedule type")
        reminder.schedule_type = st

    active_expiry = expiry_date if expiry_date_provided else None
    
    # Need to fetch doc to verify existing expiry if not provided
    doc = None
    if reminder.doc_id:
        doc = db.query(Document).filter(Document.doc_id == reminder.doc_id).first()
        if not active_expiry and doc:
            active_expiry = doc.expiry_date
            
    now_utc = datetime.now(pytz.UTC)

    if reminder.schedule_type == "DEFAULT" and active_expiry:
        expiry_local = datetime.combine(active_expiry, time(9, 0))
        expiry_local = user_timezone.localize(expiry_local)
        today_local = datetime.now(user_timezone).date()
        
        if active_expiry == today_local:
            reminder_local = datetime.now(user_timezone) + timedelta(minutes=2)
        else:
            reminder_local = expiry_local - timedelta(days=1)
            
        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)
        
        # Only validate if not strictly past to afford safe defaults
        if reminder_utc <= now_utc and active_expiry != today_local:
            pass # Ignore if it's naturally past default but don't fail, or do we? Wait create throws if in the past
        else:
            reminder.reminder_at = reminder_utc
            # Bug fix: if the reminder was already sent but we update its time, restore status
            reminder.reminder_status = "PENDING"
        
    elif reminder.schedule_type == "CUSTOM" and reminder_at:
        reminder_local = reminder_at.astimezone(user_timezone)
        reminder_local = adjust_if_today_past(reminder_local, user_timezone)
        reminder_utc = reminder_local.astimezone(pytz.UTC)
        
        if reminder_utc <= now_utc:
            raise HTTPException(400, "Reminder time is in the past")
            
        reminder.reminder_at = reminder_utc
        reminder.reminder_status = "PENDING"

    if repeat_type:
        rt = repeat_type.upper()
        if rt not in VALID_REPEAT_TYPES:
            raise HTTPException(400, "Invalid repeat type")
        reminder.repeat_type = rt

    if priority:
        p = priority.upper()
        if p not in VALID_PRIORITIES:
            raise HTTPException(400, "Invalid priority")
        reminder.priority = p

    reminder.notes = notes
    reminder.push_notification = push_notification
    reminder.email_notification = email_notification

    if remove_document:
        reminder.doc_id = None
    elif new_doc_id is not None:
        reminder.doc_id = new_doc_id
    # IMPORTANT: Existing doc_id is preserved by default
    # Only change when explicitly removing or replacing

    # Update associated document if it exists (and we didn't just remove it)
    if not remove_document and doc:
        if category and category.strip():
            doc.doc_category = category.strip()
        if document_title and document_title.strip():
            doc.doc_title = document_title.strip()
        elif reminder_title and reminder_title.strip():
            doc.doc_title = reminder_title.strip()
        if expiry_date_provided:
            doc.expiry_date = expiry_date

    result = update_reminder(db, reminder)
    return result


def delete_reminder_service(db, reminder_uuid, user_id):

    reminder = db.query(Reminder).filter(
        Reminder.reminder_uuid == reminder_uuid,
        Reminder.user_id == user_id
    ).first()

    if not reminder:
        raise HTTPException(404, "Reminder not found")

    delete_reminder(db, reminder)


def get_reminder_by_uuid_service(db, reminder_uuid, user_id):

    reminder = (
        db.query(Reminder)
        .filter(
            Reminder.reminder_uuid == reminder_uuid,
            Reminder.user_id == user_id
        )
        .first()
    )

    if not reminder:
        raise HTTPException(404, "Reminder not found")

    return reminder