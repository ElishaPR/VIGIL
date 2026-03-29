"""
Add endpoint to serve decrypted documents with proper MIME types
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User
from app.modules.user.services.document_service import get_decrypted_document_service, get_document_by_uuid

router = APIRouter(prefix="/documents", tags=["Documents"])

def get_file_icon(mime_type: str) -> str:
    """Get appropriate icon for file type"""
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
    """Get display name for file type"""
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
        document = get_document_by_uuid(db, doc_uuid, current_user.user_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Generate download URL
        from app.modules.user.services.supabase_service import get_signed_url
        download_url = get_signed_url(document.storage_key)
        
        # Extract file extension from storage key
        file_extension = document.storage_key.split('.')[-1] if '.' in document.storage_key else ''
        
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
            "created_at": document.created_at.isoformat(),
            "expiry_date": document.expiry_date.isoformat() if document.expiry_date else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document preview: {str(e)}")

@router.get("/{doc_uuid}/download")
def download_document(
    doc_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Download decrypted document with proper MIME type
    """
    try:
        # Get decrypted document
        decrypted_bytes, mime_type = get_decrypted_document_service(db, doc_uuid, current_user.user_id)
        
        # Get document info for filename
        document = get_document_by_uuid(db, doc_uuid, current_user.user_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Generate filename with proper extension
        file_extension = document.storage_key.split('.')[-1] if '.' in document.storage_key else ''
        filename = f"{document.doc_title}.{file_extension}"
        
        # Return streaming response with correct MIME type
        return StreamingResponse(
            iter([decrypted_bytes]),
            media_type=mime_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download document: {str(e)}")
