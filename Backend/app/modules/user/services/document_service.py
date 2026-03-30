from __future__ import annotations
import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.modules.user.services.supabase_service import upload_file, delete_file, replace_file, get_signed_url, download_file
from app.core.services.encryption_service import encrypt_file, decrypt_file
from app.modules.user.crud.documents import (
    create_document as crud_create_document,
    get_document_by_uuid,
    get_user_documents,
    update_document,
    delete_document
)
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
        raise HTTPException(400, "Unsupported file type")


def generate_storage_key(user_uuid: str, doc_uuid: str, extension: str):
    return f"documents/{user_uuid}/{doc_uuid}.{extension}"


async def create_document_service(
    db: Session,
    user_id: int,
    user_uuid: str,
    category: str,
    title: str,
    expiry_date,
    notes: str | None,
    file: UploadFile
):
    validate_file(file)

    contents = await file.read()

    size_bytes = len(contents)
    size_mb = size_bytes / (1024 * 1024)

    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(400, "File too large")

    doc_uuid = str(uuid.uuid4())
    extension = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    storage_key = generate_storage_key(user_uuid, doc_uuid, extension)

    encrypted_file = encrypt_file(contents)

    upload_file(storage_key, encrypted_file, file.content_type)

    try:
        document = crud_create_document(
            db=db,
            user_id=user_id,
            doc_uuid=doc_uuid,
            category=category.strip(),
            title=title.strip(),
            doc_size=size_bytes,
            expiry_date=expiry_date,
            notes=notes,
            mime_type=file.content_type,
            storage_key=storage_key
        )
        return document
    except Exception as e:
        delete_file(storage_key)
        raise e


def list_documents_service(db, user_id):
    docs = get_user_documents(db, user_id)
    return [
        {
            "doc_uuid": str(d.doc_uuid),
            "doc_title": d.doc_title,
            "doc_category": d.doc_category,
            "doc_size": d.doc_size,
            "mime_type": d.mime_type,
            "created_at": d.created_at.isoformat(),
            "is_virtual": d.storage_key.startswith("virtual/")
        }
        for d in docs
        if not d.storage_key.startswith("virtual/")  # Exclude virtual documents from list
    ]


def get_document_file_service(db, doc_uuid, user_id):
    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    # Check if this is a virtual document (doesn't exist in Supabase storage)
    if document.storage_key.startswith("virtual/"):
        # Virtual documents don't have actual files, return null URL
        return {
            "doc_uuid": str(document.doc_uuid),
            "doc_title": document.doc_title,
            "doc_category": document.doc_category,
            "mime_type": document.mime_type,
            "url": None,
            "is_virtual": True
        }

    url = get_signed_url(document.storage_key)

    return {
        "doc_uuid": str(document.doc_uuid),
        "doc_title": document.doc_title,
        "doc_category": document.doc_category,
        "mime_type": document.mime_type,
        "url": url,
        "is_virtual": False
    }


def get_decrypted_document_service(db, doc_uuid, user_id):
    document = get_document_by_uuid(db, doc_uuid, user_id)
    if not document:
        raise HTTPException(404, "Document not found")

    # Check if this is a virtual document (doesn't exist in Supabase storage)
    if document.storage_key.startswith("virtual/"):
        # Virtual documents don't have actual files, return empty content
        return b"", document.mime_type

    encrypted_bytes = download_file(document.storage_key)
    decrypted_bytes = decrypt_file(encrypted_bytes)

    return decrypted_bytes, document.mime_type


def delete_document_service(db, doc_uuid, user_id):
    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    # Only delete from Supabase if it's not a virtual document
    if not document.storage_key.startswith("virtual/"):
        delete_file(document.storage_key)
    
    delete_document(db, document)


async def update_document_service(
    db,
    user_id,
    doc_uuid,
    category,
    title,
    expiry_date,       # None means "not sent" — don't change; "" means clear
    notes,
    file,
    user_uuid
):
    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    if file:
        validate_file(file)
        contents = await file.read()
        encrypted = encrypt_file(contents)
        replace_file(document.storage_key, encrypted, file.content_type)
        document.doc_size = len(contents)
        document.mime_type = file.content_type

    if category:
        document.doc_category = category.strip()

    if title:
        document.doc_title = title.strip()

    if notes is not None:
        document.notes = notes.strip() if notes else None

    if expiry_date is not None:
        document.expiry_date = expiry_date if expiry_date else None

    return update_document(db, document)