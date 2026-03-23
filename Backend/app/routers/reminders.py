import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from app.database import get_db
from app.dependencies.auth_cookie import get_current_user
from app.models.users import User
from app.models.documents import Document

from app.crud.documents import get_document_by_uuid, create_document

from app.services.document_service import create_document_service
from app.services.reminder_service import (
    create_reminder_service,
    update_reminder_service,
    delete_reminder_service,
    get_reminder_by_uuid_service
)
from app.services.dashboard_service import get_dashboard_reminders_service


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
        raise HTTPException(404, str(e))

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
        "status": reminder.reminder_status
    }


# ---------------- CREATE ----------------
@router.post("/create")
async def create_reminder_api(

    # OPTIONAL DOCUMENT
    document: UploadFile | None = File(None),

    category: str | None = Form(None),
    title: str = Form(...),

    expiry_date: str = Form(...),
    schedule_type: str = Form(...),

    reminder_at: str | None = Form(None),

    repeat_type: str = Form(...),
    priority: str = Form(...),

    enable_push: bool = Form(...),
    notes: str | None = Form(None),

    timezone: str = Form(...),
    doc_uuid: str | None = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if timezone not in pytz.all_timezones:
        raise HTTPException(400, "Invalid timezone")

    user_tz = pytz.timezone(timezone)

    expiry_date_parsed = datetime.strptime(expiry_date, "%Y-%m-%d").date()

    reminder_dt = None
    if reminder_at:
        reminder_dt = datetime.fromisoformat(reminder_at)
        if reminder_dt.tzinfo is None:
            reminder_dt = pytz.UTC.localize(reminder_dt)

    try:
        doc_id = None

        # CASE 1: link to existing doc
        if doc_uuid:
            doc = get_document_by_uuid(db, doc_uuid, current_user.user_id)
            if not doc:
                raise HTTPException(404, "Document not found")
            doc_id = doc.doc_id

        # CASE 2: new file upload
        elif document and document.filename:
            doc = await create_document_service(
                db=db,
                user_id=current_user.user_id,
                user_uuid=str(current_user.user_uuid),
                category=category or "general",
                title=title,
                expiry_date=expiry_date_parsed,
                file=document
            )
            doc_id = doc.doc_id

        # CASE 3: no file but has expiry or category — create a virtual doc record
        elif expiry_date_parsed or category:
            doc = create_document(
                db=db,
                user_id=current_user.user_id,
                doc_uuid=str(uuid.uuid4()),
                category=category or "general",
                title=title,
                doc_size=0,
                expiry_date=expiry_date_parsed,
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
            title=title,
            expiry_date=expiry_date_parsed,
            schedule_type=schedule_type,
            reminder_at=reminder_dt,
            repeat_type=repeat_type,
            priority=priority,
            notes=notes,
            enable_push=enable_push,
            user_timezone=user_tz
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

    return {
        "reminder_uuid": str(reminder.reminder_uuid)
    }


# ---------------- UPDATE ----------------
@router.put("/{reminder_uuid}")
def update_reminder(

    reminder_uuid: str,

    reminder_title: str | None = Form(None),
    category: str | None = Form(None),
    expiry_date: str | None = Form(None),
    schedule_type: str | None = Form(None),
    reminder_at: str | None = Form(None),
    repeat_type: str | None = Form(None),
    priority: str | None = Form(None),
    enable_push: bool = Form(...),
    email_notification: bool = Form(True),
    notes: str | None = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Parse reminder datetime
    reminder_dt = None
    if reminder_at:
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
        reminder = update_reminder_service(
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
            expiry_date_provided=expiry_date_provided
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Update failed: {str(e)}")

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