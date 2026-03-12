from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
import pytz

from app.database import get_db
from app.services.document_service import create_document
from app.services.reminder_service import create_reminder
from app.dependencies.auth_cookie import get_current_user
from app.models.users import User

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.post("/create")
async def create_reminder_api(

    category: str = Form(...),
    title: str = Form(...),

    expiry_date: date = Form(...),

    schedule_type: str = Form(...),
    reminder_at: str | None = Form(None),

    repeat_type: str = Form(...),
    priority: str = Form(...),

    enable_push: bool = Form(False),
    notes: str | None = Form(None),

    timezone: str = Form(...),

    document: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    try:
        user_tz = pytz.timezone(timezone)
    except Exception:
        raise HTTPException(400, "Invalid timezone")

    try:
        expiry_dt = date.fromisoformat(expiry_date)
    except:
        raise HTTPException(400, "Invalid expiry date")

    expiry_dt = user_tz.localize(expiry_dt)

    reminder_dt = None

    if reminder_at:
        try:
            reminder_dt = datetime.fromisoformat(reminder_at)
            reminder_dt = user_tz.localize(reminder_dt)
        except Exception:
            raise HTTPException(400, "Invalid reminder date")

    doc = create_document(
        db=db,
        user_id=current_user.user_id,
        user_uuid=str(current_user.user_uuid),
        category=category,
        title=title,
        expiry_date=expiry_dt.date(),
        file=document
    )

    reminder = create_reminder(
        db=db,
        doc_id=doc.doc_id,
        title=title,
        expiry_date=expiry_dt.date(),
        schedule_type=schedule_type,
        reminder_at=reminder_dt,
        repeat_type=repeat_type,
        priority=priority,
        notes=notes,
        enable_push=enable_push
    )

    return {
        "doc_uuid": str(doc.doc_uuid),
        "reminder_uuid": str(reminder.reminder_uuid)
    }