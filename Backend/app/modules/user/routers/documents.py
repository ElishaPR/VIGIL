from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User

from app.modules.user.services.document_service import (
    create_document_service,
    list_documents_service,
    delete_document_service,
    update_document_service,
    get_document_file_service,
    get_decrypted_document_service
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(

    category: str = Form(...),
    title: str = Form(...),
    notes: Optional[str] = Form(None),

    file: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not title or len(title.strip()) < 3:
        raise HTTPException(400, "Title must be at least 3 characters")

    if not category or not category.strip():
        raise HTTPException(400, "Category is required")



    try:
        document = await create_document_service(
            db=db,
            user_id=current_user.user_id,
            user_uuid=str(current_user.user_uuid),
            category=category,
            title=title,
            expiry_date=None,
            notes=notes,
            file=file
        )
        db.commit()
        db.refresh(document)
    except HTTPException:
        db.rollback()
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


@router.get("/{doc_uuid}/download")
def download_document(
    doc_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    decrypted_bytes, mime_type = get_decrypted_document_service(db, doc_uuid, current_user.user_id)
    
    # Get document info for filename
    from app.modules.user.crud.documents import get_document_by_uuid
    document = get_document_by_uuid(db, doc_uuid, current_user.user_id)
    
    # Generate filename with proper extension
    file_extension = document.storage_key.split('.')[-1] if '.' in document.storage_key else ''
    filename = f"{document.doc_title}.{file_extension}"
    
    return StreamingResponse(
        iter([decrypted_bytes]), 
        media_type=mime_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/{doc_uuid}/preview")
def get_document_preview(
    doc_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get document preview information including download URL
    """
    try:
        # Get document from database
        from app.modules.user.crud.documents import get_document_by_uuid
        from app.modules.user.services.supabase_service import get_signed_url
        
        document = get_document_by_uuid(db, doc_uuid, current_user.user_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if this is a virtual document
        is_virtual = document.storage_key.startswith("virtual/")
        
        # Generate download URL only for non-virtual documents
        download_url = None
        if not is_virtual:
            download_url = get_signed_url(document.storage_key)
        
        # Extract file extension from storage key
        file_extension = document.storage_key.split('.')[-1] if '.' in document.storage_key else ''
        
        # Helper functions for file type display
        def get_file_icon(mime_type: str) -> str:
            if mime_type.startswith("image/"):
                return "image"
            elif mime_type == "application/pdf":
                return "pdf"
            elif mime_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                return "docx"
            elif mime_type in ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
                return "xlsx"
            elif mime_type == "text/plain":
                return "txt"
            else:
                return "file"
        
        def get_display_name(mime_type: str) -> str:
            if mime_type.startswith("image/"):
                return "Image"
            elif mime_type == "application/pdf":
                return "PDF Document"
            elif mime_type == "application/msword":
                return "Word Document (.doc)"
            elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "Word Document (.docx)"
            elif mime_type == "application/vnd.ms-excel":
                return "Excel Spreadsheet (.xls)"
            elif mime_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "Excel Spreadsheet (.xlsx)"
            elif mime_type == "text/plain":
                return "Text File"
            else:
                return "Document"
        
        return {
            "doc_uuid": str(document.doc_uuid),
            "doc_title": document.doc_title,
            "doc_category": document.doc_category,
            "doc_size": document.doc_size,
            "mime_type": document.mime_type,
            "file_extension": file_extension,
            "display_name": get_display_name(document.mime_type),
            "file_icon": get_file_icon(document.mime_type),
            "download_url": download_url,
            "is_virtual": is_virtual,
            "created_at": document.created_at.isoformat(),
            "expiry_date": document.expiry_date.isoformat() if document.expiry_date else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document preview: {str(e)}")


@router.put("/{doc_uuid}")
async def update_document(

    doc_uuid: str,

    category: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),

    file: Optional[UploadFile] = File(None),

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
            expiry_date=None,
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