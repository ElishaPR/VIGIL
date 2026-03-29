from __future__ import annotations
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User
from app.modules.user.models.documents import Document

from app.modules.user.crud.documents import get_document_by_uuid, create_document

from app.modules.user.services.document_service import create_document_service
from app.modules.user.services.reminder_service import (
    create_reminder_service,
    update_reminder_service,
    delete_reminder_service,
    get_reminder_by_uuid_service
)
from app.modules.user.services.dashboard_service import get_dashboard_reminders_service
from app.modules.user.schemas.reminder_requests import AddReminderRequest


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


# ---------------- DASHBOARD ----------------
@router.get("/dashboard")
def get_dashboard_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reminders = get_dashboard_reminders_service(
        db=db,
        user_id=current_user.user_id
    )

    return {"reminders": reminders}


# ---------------- GET SINGLE REMINDER ----------------
@router.get("/{reminder_uuid}")
def get_reminder(
    reminder_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # B2 fix: use correct field names and query document separately
    try:
        reminder = get_reminder_by_uuid_service(
            db, reminder_uuid, current_user.user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    doc = None
    if reminder.doc_id:
        doc = db.query(Document).filter(Document.doc_id == reminder.doc_id).first()

    return {
        "reminder_uuid": str(reminder.reminder_uuid),
        "reminder_title": reminder.reminder_title,
        "category": doc.doc_category.lower() if doc else "general",
        "expiry_date": doc.expiry_date.isoformat() if (doc and doc.expiry_date) else None,
        "schedule_type": reminder.schedule_type.lower(),
        "reminder_at": reminder.reminder_at.isoformat() if reminder.reminder_at else None,
        "repeat_type": reminder.repeat_type.lower(),
        "priority": reminder.priority.lower(),
        "push_notification": reminder.push_notification,
        "email_notification": reminder.email_notification,
        "notes": reminder.notes,
        "status": reminder.reminder_status,
        "document_url": f"http://localhost:8000/documents/{doc.doc_uuid}" if doc and doc.doc_size > 0 else None,
        "document_name": doc.doc_title if doc and doc.doc_size > 0 else None
    }


# ---------------- CREATE ----------------
@router.post("/create")
async def create_reminder_api(
    # OPTIONAL DOCUMENT
    document: Optional[UploadFile] = File(None),
    form_data: AddReminderRequest = Depends(AddReminderRequest.as_form),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if form_data.timezone not in pytz.all_timezones:
        raise HTTPException(status_code=400, detail="Invalid timezone")

    user_tz = pytz.timezone(form_data.timezone)
    expiry_date_parsed = datetime.strptime(form_data.expiry_date, "%Y-%m-%d").date()

    reminder_dt = None
    if form_data.reminder_at and form_data.reminder_at.strip():
        reminder_dt = datetime.fromisoformat(form_data.reminder_at)
        if reminder_dt.tzinfo is None:
            reminder_dt = pytz.UTC.localize(reminder_dt)

    try:
        doc_id = None

        # CASE 1: link to existing doc
        if form_data.doc_uuid:
            doc = get_document_by_uuid(db, form_data.doc_uuid, current_user.user_id)
            if not doc:
                raise HTTPException(status_code=404, detail="Document not found")
            doc_id = doc.doc_id

        # CASE 2: new file upload
        elif document and document.filename:
            doc = await create_document_service(
                db=db,
                user_id=current_user.user_id,
                user_uuid=str(current_user.user_uuid),
                category=form_data.category or "general",
                title=form_data.title,
                expiry_date=expiry_date_parsed,
                notes=form_data.notes,
                file=document
            )
            doc_id = doc.doc_id

        # CASE 3: no file but has expiry or category — create a virtual doc record
        elif expiry_date_parsed or form_data.category:
            doc = create_document(
                db=db,
                user_id=current_user.user_id,
                doc_uuid=str(uuid.uuid4()),
                category=form_data.category or "general",
                title=form_data.title,
                doc_size=0,
                expiry_date=expiry_date_parsed,
                notes=form_data.notes,
                mime_type="text/plain",
                storage_key=f"virtual/{current_user.user_id}/{uuid.uuid4()}"
            )
            doc_id = doc.doc_id

        # CASE 4: no doc context at all
        else:
            doc_id = None

        reminder = create_reminder_service(
            db=db,
            user_id=current_user.user_id,
            doc_id=doc_id,
            title=form_data.title,
            expiry_date=expiry_date_parsed,
            schedule_type=form_data.schedule_type,
            reminder_at=reminder_dt,
            repeat_type=form_data.repeat_type,
            priority=form_data.priority,
            notes=form_data.notes,
            enable_push=form_data.enable_push,
            user_timezone=user_tz
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "reminder_uuid": str(reminder.reminder_uuid)
    }


# ---------------- UPDATE ----------------
@router.put("/{reminder_uuid}")
async def update_reminder(

    reminder_uuid: str,

    reminder_title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    schedule_type: Optional[str] = Form(None),
    reminder_at: Optional[str] = Form(None),
    repeat_type: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    timezone: str = Form("UTC"),
    enable_push: bool = Form(False),
    email_notification: bool = Form(True),
    document: Optional[UploadFile] = File(None),
    remove_document: bool = Form(False),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Parse reminder datetime
    reminder_dt = None
    if reminder_at and reminder_at.strip():
        try:
            reminder_local = datetime.fromisoformat(reminder_at)
            if reminder_local.tzinfo is None:
                reminder_local = pytz.UTC.localize(reminder_local)
            else:
                reminder_local = reminder_local.astimezone(pytz.UTC)
            reminder_dt = reminder_local
        except Exception:
            raise HTTPException(400, "Invalid reminder date")

    # Parse expiry_date — None means "not sent"
    expiry_date_provided = expiry_date is not None
    expiry_date_parsed = None
    if expiry_date and expiry_date.strip():
        try:
            expiry_date_parsed = datetime.strptime(expiry_date.strip(), "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid expiry_date format. Use YYYY-MM-DD.")

    try:
        # Document handling in update
        doc_id = None
        current_reminder = get_reminder_by_uuid_service(db, reminder_uuid, current_user.user_id)
        
        if remove_document:
            # Note: The service will handle setting doc_id to null if it exists
            pass 
        elif document and document.filename:
            # Create new doc
            new_doc = await create_document_service(
                db=db,
                user_id=current_user.user_id,
                user_uuid=str(current_user.user_uuid),
                category=category or "general",
                title=reminder_title or current_reminder.reminder_title,
                expiry_date=expiry_date_parsed or (db.query(Document).filter(Document.doc_id == current_reminder.doc_id).first().expiry_date if current_reminder.doc_id else None),
                notes=notes,
                file=document
            )
            doc_id = new_doc.doc_id

        reminder = await update_reminder_service(
            db,
            reminder_uuid,
            current_user.user_id,
            schedule_type,
            reminder_dt,
            repeat_type,
            priority,
            notes,
            push_notification=enable_push,
            email_notification=email_notification,
            reminder_title=reminder_title,
            category=category,
            expiry_date=expiry_date_parsed,
            expiry_date_provided=expiry_date_provided,
            user_timezone=pytz.timezone(timezone.strip()) if timezone and timezone.strip() in pytz.all_timezones else pytz.UTC,
            new_doc_id=doc_id,
            remove_document=remove_document
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

    return {
        "reminder_uuid": str(reminder.reminder_uuid)
    }


# ---------------- DELETE ----------------
@router.delete("/{reminder_uuid}")
def delete_reminder(
    reminder_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        delete_reminder_service(
            db,
            reminder_uuid,
            current_user.user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Delete failed: {str(e)}")

    return {"message": "Reminder deleted"}