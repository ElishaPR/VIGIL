import os
from app.core.config import UPLOAD_FOLDER
from fastapi import UploadFile
from app.crud.documents import create_document
from sqlalchemy.orm import Session
from app.schemas.reminder_requests import CreateReminderData

async def store_file(file: UploadFile, content: bytes):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    created_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(created_path, "wb") as f:
        f.write(content)
    return created_path

def extract_doc_metadata(file: UploadFile, content:bytes):
    doc_title = file.filename
    mime_type = file.content_type
    doc_size = len(content)
    return ({"doc_title": doc_title, "mime_type": mime_type, "doc_size": doc_size})

async def handle_doc_upload(db: Session, uploaded_file: UploadFile, request_data: CreateReminderData, user_id: int):
    content = await uploaded_file.read()
    doc_metadata = extract_doc_metadata(uploaded_file, content)
    storage_key = await store_file(uploaded_file, content)
    doc_metadata.update({"user_id": user_id, "storage_key": storage_key, "doc_category": request_data.document.doc_category, "expiry_date": request_data.document.expiry_date})
    document = create_document(db, doc_metadata)
    return document 