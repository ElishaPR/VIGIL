import uuid
import os

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.documents import Document
from app.services.supabase_service import upload_file
from app.services.encryption_service import encrypt_file
from app.core.config import settings


ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]


def validate_file(file: UploadFile):

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")


def generate_storage_key(user_uuid: str, doc_uuid: str, extension: str):

    return f"documents/{user_uuid}/{doc_uuid}.{extension}"


def create_document(
        db: Session,
        user_id: int,
        user_uuid: str,
        category: str,
        file: UploadFile
):

    validate_file(file)

    contents = file.file.read()

    size_mb = len(contents) / (1024 * 1024)

    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail="File too large")

    doc_uuid = str(uuid.uuid4())

    extension = file.filename.split(".")[-1]

    storage_key = generate_storage_key(
        user_uuid,
        doc_uuid,
        extension
    )

    encrypted = encrypt_file(contents)

    upload_file(
        storage_key,
        encrypted,
        file.content_type
    )

    document = Document(
        user_id=user_id,
        doc_uuid=doc_uuid,
        category=category.strip(),
        storage_key=storage_key,
        mime_type=file.content_type
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document