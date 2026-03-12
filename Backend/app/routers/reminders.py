from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.services.document_service import create_document
from app.services.reminder_service import create_reminder
from app.models.users import User


router = APIRouter(prefix="/reminders")


@router.post("/create")

async def create_reminder_api(

    category: str = Form(...),
    title: str = Form(...),
    expiry_date: date = Form(...),

    schedule_type: str = Form(...),
    reminder_at: datetime | None = Form(None),

    repeat_type: str = Form(...),
    priority: str = Form(...),

    enable_push: bool = Form(False),
    notes: str | None = Form(None),

    document: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user: User = Depends()

):

    doc = create_document(
        db,
        current_user.user_id,
        current_user.user_uuid,
        category,
        title,
        expiry_date,
        document
    )

    reminder = create_reminder(
        db,
        doc.doc_id,
        title,
        expiry_date,
        schedule_type,
        reminder_at,
        repeat_type,
        priority,
        notes,
        enable_push
    )

    return {
        "doc_uuid": doc.doc_uuid,
        "reminder_uuid": reminder.reminder_uuid
    }