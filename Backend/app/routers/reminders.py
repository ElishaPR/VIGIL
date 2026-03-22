from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from app.database import get_db
from app.dependencies.auth_cookie import get_current_user
from app.models.users import User

from app.crud.documents import get_document_by_uuid

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

    return {
        "reminders": reminders
    }


# ---------------- GET SINGLE REMINDER ----------------
@router.get("/{reminder_uuid}")
def get_reminder(

    reminder_uuid: str,

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    try:
        reminder = get_reminder_by_uuid_service(
            db,
            reminder_uuid,
            current_user.user_id
        )

    except Exception as e:
        raise HTTPException(404, str(e))


    return {
        "reminder_uuid": str(reminder.reminder_uuid),
        "title": reminder.title,
        "category": reminder.document.category,
        "expiryDate": reminder.document.expiry_date.isoformat(),
        "schedule_type": reminder.schedule_type,
        "reminder_at": reminder.reminder_at.isoformat() if reminder.reminder_at else None,
        "repeat_type": reminder.repeat_type,
        "priority": reminder.priority,
        "enable_push": reminder.enable_push,
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

    try:
        doc_id = None

        # CASE 1: existing doc
        if doc_uuid:
            doc = get_document_by_uuid(db, doc_uuid, current_user.user_id)
            if not doc:
                raise HTTPException(404, "Document not found")
            doc_id = doc.doc_id

        # CASE 2: new doc upload
        elif document:
            doc = create_document_service(
                db=db,
                user_id=current_user.user_id,
                user_uuid=str(current_user.user_uuid),
                category=category,
                title=title,
                expiry_date=expiry_date_parsed,
                file=document
            )
            doc_id = doc.doc_id

        # CASE 3: reminder only → doc_id = None

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

    schedule_type: str | None = Form(None),
    reminder_at: str | None = Form(None),
    repeat_type: str | None = Form(None),
    priority: str | None = Form(None),
    enable_push: bool = Form(...),
    notes: str | None = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    # -------- PARSE REMINDER --------
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
            enable_push
        )
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
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Delete failed: {str(e)}")

    return {"message": "Reminder deleted"}