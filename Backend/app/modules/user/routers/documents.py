from __future__ import annotations
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User

from app.modules.user.services.document_service import (
    create_document_service,
    list_documents_service,
    delete_document_service,
    update_document_service,
    get_document_file_service
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(

    category: str = Form(...),
    title: str = Form(...),
    expiry_date: str | None = Form(None),
    notes: str | None = Form(None),

    file: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not title or len(title.strip()) < 3:
        raise HTTPException(400, "Title must be at least 3 characters")

    if not category or not category.strip():
        raise HTTPException(400, "Category is required")

    expiry_parsed = None
    if expiry_date and expiry_date.strip():
        from datetime import datetime
        try:
            expiry_parsed = datetime.strptime(expiry_date.strip(), "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid expiry_date format. Use YYYY-MM-DD.")

    try:
        document = await create_document_service(
            db=db,
            user_id=current_user.user_id,
            user_uuid=str(current_user.user_uuid),
            category=category,
            title=title,
            expiry_date=expiry_parsed,
            notes=notes,
            file=file
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

    return {"doc_uuid": str(document.doc_uuid)}


@router.get("/list")
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_documents_service(db, current_user.user_id)


@router.get("/{doc_uuid}")
def view_document(
    doc_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_document_file_service(db, doc_uuid, current_user.user_id)


@router.put("/{doc_uuid}")
async def update_document(

    doc_uuid: str,

    category: str | None = Form(None),
    title: str | None = Form(None),
    expiry_date: str | None = Form(None),
    notes: str | None = Form(None),

    file: UploadFile | None = File(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Validate title if provided
    if title is not None and title.strip() and len(title.strip()) < 3:
        raise HTTPException(400, "Title must be at least 3 characters")

    try:
        doc = await update_document_service(
            db=db,
            user_id=current_user.user_id,
            doc_uuid=doc_uuid,
            category=category,
            title=title,
            expiry_date=expiry_date,
            notes=notes,
            file=file if (file and file.filename) else None,
            user_uuid=str(current_user.user_uuid)
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

    return {"doc_uuid": str(doc.doc_uuid)}


@router.delete("/{doc_uuid}")
def delete_document(

    doc_uuid: str,

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        delete_document_service(db, doc_uuid, current_user.user_id)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

    return {"message": "Document deleted"}