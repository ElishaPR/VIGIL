from __future__ import annotations
from sqlalchemy.orm import Session
from app.modules.user.models.documents import Document


def create_document(
    db: Session,
    user_id: int,
    doc_uuid,
    category: str,
    title: str,
    doc_size: int,
    expiry_date,
    notes: str | None,
    mime_type: str,
    storage_key: str
):

    document = Document(
        user_id=user_id,
        doc_uuid=doc_uuid if doc_uuid else None,  # ✅ FIX
        doc_category=category,
        doc_title=title,
        doc_size=doc_size,
        expiry_date=expiry_date,
        notes=notes,
        mime_type=mime_type,
        storage_key=storage_key
    )

    db.add(document)
    db.flush()
    db.refresh(document)

    return document

def get_document_by_uuid(db: Session, doc_uuid: str, user_id: int):

    return db.query(Document).filter(
        Document.doc_uuid == doc_uuid,
        Document.user_id == user_id
    ).first()


def get_user_documents(db: Session, user_id: int):

    return db.query(Document).filter(
        Document.user_id == user_id
    ).order_by(Document.created_at.desc()).all()


def update_document(db: Session, document: Document):

    db.commit()
    db.refresh(document)

    return document


def delete_document(db: Session, document: Document):

    db.delete(document)
    db.commit()