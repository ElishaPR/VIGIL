from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from app.database import get_db
from app.dependencies.auth_cookie import get_current_user
from app.models.users import User

from app.services.document_service import create_document_service
from app.services.reminder_service import create_reminder_service, update_reminder_service, delete_reminder_service
from app.services.dashboard_service import get_dashboard_reminders_service


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


@router.post("/create")
async def create_reminder_api(

    category: str = Form(...),
    title: str = Form(...),

    expiry_date: str = Form(...),

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

    # Validate timezone
    try:
        user_tz = pytz.timezone(timezone)
    except Exception:
        raise HTTPException(400, "Invalid timezone")


    # Parse expiry date
    try:
        expiry_date_parsed = datetime.strptime(
            expiry_date,
            "%Y-%m-%d"
        ).date()
    except Exception:
        raise HTTPException(400, "Invalid expiry date")


    reminder_dt = None

    # Parse custom reminder datetime if provided
    if reminder_at:

        try:
            reminder_local = datetime.fromisoformat(reminder_at)

            reminder_local = user_tz.localize(reminder_local)

            reminder_dt = reminder_local.astimezone(pytz.UTC)

        except Exception:
            raise HTTPException(400, "Invalid reminder date")


    # Create document
    document_record = create_document_service(
        db=db,
        user_id=current_user.user_id,
        user_uuid=str(current_user.user_uuid),
        category=category,
        title=title,
        expiry_date=expiry_date_parsed,
        file=document
    )


    # Create reminder
    reminder_record = create_reminder_service(
        db=db,
        doc_id=document_record.doc_id,
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


    return {

        "message": "Reminder created successfully",

        "doc_uuid": str(document_record.doc_uuid),

        "reminder_uuid": str(reminder_record.reminder_uuid)

    }


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



@router.put("/{reminder_uuid}")
def update_reminder(

    reminder_uuid: str,

    schedule_type: str | None = Form(None),
    reminder_at: str | None = Form(None),
    repeat_type: str | None = Form(None),
    priority: str | None = Form(None),
    enable_push: bool = Form(False),
    notes: str | None = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    reminder = update_reminder_service(
        db,
        reminder_uuid,
        schedule_type,
        reminder_at,
        repeat_type,
        priority,
        notes,
        enable_push
    )

    return {
        "reminder_uuid": str(reminder.reminder_uuid)
    }


@router.delete("/{reminder_uuid}")
def delete_reminder(

    reminder_uuid: str,

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    delete_reminder_service(
        db,
        reminder_uuid
    )

    return {"message": "Reminder deleted"}