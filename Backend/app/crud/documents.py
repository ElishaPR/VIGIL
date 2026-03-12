from sqlalchemy.orm import Session
from app.models.documents import Document


def create_document(
    db: Session,
    user_id: int,
    doc_uuid: str,
    category: str,
    title: str,
    doc_size: int,
    expiry_date,
    mime_type: str,
    storage_key: str
):

    document = Document(
        user_id=user_id,
        doc_uuid=doc_uuid,
        doc_category=category,
        doc_title=title,
        doc_size=doc_size,
        expiry_date=expiry_date,
        mime_type=mime_type,
        storage_key=storage_key
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document