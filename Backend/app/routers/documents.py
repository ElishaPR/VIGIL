from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth_cookie import get_current_user
from app.models.users import User

from app.services.document_service import (
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

    file: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    document = create_document_service(
        db=db,
        user_id=current_user.user_id,
        user_uuid=str(current_user.user_uuid),
        category=category,
        title=title,
        expiry_date=expiry_date,
        file=file
    )

    return {
        "doc_uuid": str(document.doc_uuid)
    }


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

    return get_document_file_service(
        db,
        doc_uuid,
        current_user.user_id
    )


@router.put("/{doc_uuid}")
async def update_document(

    doc_uuid: str,

    category: str | None = Form(None),
    title: str | None = Form(None),
    expiry_date: str | None = Form(None),

    file: UploadFile | None = File(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    doc = update_document_service(
        db=db,
        user_id=current_user.user_id,
        doc_uuid=doc_uuid,
        category=category,
        title=title,
        expiry_date=expiry_date,
        file=file,
        user_uuid=str(current_user.user_uuid)
    )

    return {"doc_uuid": str(doc.doc_uuid)}


@router.delete("/{doc_uuid}")
def delete_document(

    doc_uuid: str,

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)

):

    delete_document_service(
        db,
        doc_uuid,
        current_user.user_id
    )

    return {"message": "Document deleted"}