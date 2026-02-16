from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.schemas.reminder_requests import CreateReminderData, CreateReminderUserResponse
from app.services.document_service import handle_doc_upload
from app.services.reminder_service import handle_reminder
from app.core.security import get_current_user_payload
import json

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.post("/addreminder", response_model= CreateReminderUserResponse, status_code=201)
async def addreminder(
    reminder_data: str = Form(...), 
    uploaded_doc: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    token_data: dict = Depends(get_current_user_payload)):
    try:
        data = json.loads(reminder_data)
        reminder_data = CreateReminderData(**data)
        user_id = token_data["user_id"]
        document = await handle_doc_upload(db, uploaded_doc, reminder_data, user_id)
        reminder = handle_reminder(db, reminder_data, document.doc_id)
        return CreateReminderUserResponse(reminder_uuid = str(reminder.reminder_uuid), doc_uuid = str(document.doc_uuid), reminder_title = reminder.reminder_title, doc_title = document.doc_title, doc_category = document.doc_category, schedule_type = reminder.schedule_type, expiry_date = str(document.expiry_date), reminder_at = str(reminder.reminder_at), repeat_type = reminder.repeat_type, push_notification = reminder.push_notification, priority = reminder.priority, notes = reminder.notes)
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to create reminder!")