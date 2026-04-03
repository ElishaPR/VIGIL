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
        # Always return doc_uuid if doc exists (even virtual) — frontend uses this to load preview
        "doc_uuid": str(doc.doc_uuid) if doc else None,
        "is_virtual_doc": doc.storage_key.startswith("virtual/") if doc else False,
        # Only expose document_url/name for non-virtual (has real file)
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

        # Commit the whole transaction here (CRUD uses flush now)
        db.commit()
        db.refresh(reminder)

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
    document_title: Optional[str] = Form(None),
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
        current_reminder = get_reminder_by_uuid_service(db, reminder_uuid, current_user.user_id)
        print(f"[DEBUG] Fetched reminder, current doc_id: {current_reminder.doc_id}")
        print(f"[DEBUG] remove_document flag: {remove_document}")
        print(f"[DEBUG] document file received: {document}")
        if document:
            print(f"[DEBUG] document.filename: {document.filename}")

        # Fetch existing linked document (if any)
        existing_doc = None
        if current_reminder.doc_id:
            existing_doc = db.query(Document).filter(
                Document.doc_id == current_reminder.doc_id
            ).first()

        # Determine the doc_id to use after update
        doc_id = current_reminder.doc_id

        if remove_document:
            # Unlink doc from reminder
            print(f"[DEBUG] Setting doc_id to None because remove_document=True")
            doc_id = None
            # If the linked doc was virtual, delete it (it's an orphan now)
            if existing_doc and existing_doc.storage_key.startswith("virtual/"):
                db.delete(existing_doc)

        elif document and document.filename:
            if existing_doc and existing_doc.storage_key.startswith("virtual/"):
                # UPGRADE: convert virtual doc to real by uploading into it
                from app.modules.user.services.document_service import create_document_service as _create_doc
                from app.modules.user.services.supabase_service import upload_file
                from app.core.services.encryption_service import encrypt_file
                from app.modules.user.services.document_service import validate_file
                import uuid as _uuid

                validate_file(document)
                contents = await document.read()
                from app.core.config import settings
                if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                    raise HTTPException(400, "File too large")
                encrypted = encrypt_file(contents)
                storage_key = f"documents/{current_user.user_uuid}/{_uuid.uuid4()}.{document.filename.rsplit('.', 1)[-1]}"
                upload_file(storage_key, encrypted, document.content_type)

                existing_doc.storage_key = storage_key
                existing_doc.doc_size = len(contents)
                existing_doc.mime_type = document.content_type
                if expiry_date_parsed:
                    existing_doc.expiry_date = expiry_date_parsed
                if category:
                    existing_doc.doc_category = category.strip()
                # Keep same doc_id — reminder link unchanged
            else:
                # Create a brand new document record and link it
                # First, delete old file from Supabase if it exists (and not virtual)
                if existing_doc and existing_doc.storage_key and not existing_doc.storage_key.startswith("virtual/"):
                    from app.modules.user.services.supabase_service import delete_file
                    try:
                        delete_file(existing_doc.storage_key)
                        print(f"[DEBUG] Deleted old file from Supabase: {existing_doc.storage_key}")
                    except Exception as e:
                        print(f"[DEBUG] Warning: Failed to delete old file from Supabase: {e}")
                
                new_doc = await create_document_service(
                    db=db,
                    user_id=current_user.user_id,
                    user_uuid=str(current_user.user_uuid),
                    category=category or "general",
                    title=reminder_title or current_reminder.reminder_title,
                    expiry_date=expiry_date_parsed or (existing_doc.expiry_date if existing_doc else None),
                    notes=notes,
                    file=document
                )
                doc_id = new_doc.doc_id
                print(f"[DEBUG] Created new document, new doc_id: {doc_id}")
                
                # Delete old document record from DB to prevent orphans
                if existing_doc:
                    db.delete(existing_doc)
                    print(f"[DEBUG] Deleted old document record from DB: {existing_doc.doc_id}")

        print(f"[DEBUG] Final doc_id before calling update_reminder_service: {doc_id}")
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
            expiry_date_provided=expiry_date_provided,
            user_timezone=pytz.timezone(timezone.strip()) if timezone and timezone.strip() in pytz.all_timezones else pytz.UTC,
            new_doc_id=doc_id,
            remove_document=remove_document,
            document_title=document_title
        )

        db.commit()
        db.refresh(reminder)

    except HTTPException:
        db.rollback()
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