from sqlalchemy.orm import Session
from app.models.documents import Document


def create_document(
        db: Session,
        user_id: int,
        doc_uuid: str,
        category: str,
        storage_key: str,
        mime_type: str
):

    document = Document(
        user_id=user_id,
        doc_uuid=doc_uuid,
        category=category,
        storage_key=storage_key,
        mime_type=mime_type
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document