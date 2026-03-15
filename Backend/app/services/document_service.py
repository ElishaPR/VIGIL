import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.services.supabase_service import upload_file, delete_file, replace_file, get_signed_url
from app.services.encryption_service import encrypt_file, decrypt_file
from app.crud.documents import create_document as crud_create_document, get_document_by_uuid, get_user_documents, update_document, delete_document
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


def create_document_service(
    db: Session,
    user_id: int,
    user_uuid: str,
    category: str,
    title: str,
    expiry_date,
    file: UploadFile
):

    validate_file(file)

    contents = file.file.read()

    size_bytes = len(contents)

    size_mb = size_bytes / (1024 * 1024)

    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(400, "File too large")

    doc_uuid = str(uuid.uuid4())

    extension = file.filename.split(".")[-1]

    storage_key = generate_storage_key(
        user_uuid,
        doc_uuid,
        extension
    )

    encrypted_file = encrypt_file(contents)

    upload_file(
        storage_key,
        encrypted_file,
        file.content_type
    )

    document = crud_create_document(
        db=db,
        user_id=user_id,
        doc_uuid=doc_uuid,
        category=category.strip(),
        title=title.strip(),
        doc_size=size_bytes,
        expiry_date=expiry_date,
        mime_type=file.content_type,
        storage_key=storage_key
    )

    return document




def list_documents_service(db, user_id):

    return get_user_documents(db, user_id)


def get_document_file_service(db, doc_uuid, user_id):

    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    url = get_signed_url(document.storage_key)

    return {
        "doc_uuid": doc_uuid,
        "url": url
    }


def delete_document_service(db, doc_uuid, user_id):

    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    delete_file(document.storage_key)

    delete_document(db, document)


def update_document_service(
    db,
    user_id,
    doc_uuid,
    category,
    title,
    expiry_date,
    file,
    user_uuid
):

    document = get_document_by_uuid(db, doc_uuid, user_id)

    if not document:
        raise HTTPException(404, "Document not found")

    if file:

        validate_file(file)

        contents = file.file.read()

        encrypted = encrypt_file(contents)

        replace_file(
            document.storage_key,
            encrypted,
            file.content_type
        )

        document.doc_size = len(contents)
        document.mime_type = file.content_type

    if category:
        document.doc_category = category

    if title:
        document.doc_title = title

    document.expiry_date = expiry_date

    return update_document(db, document)