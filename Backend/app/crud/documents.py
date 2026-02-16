from app.models.documents import Document
from sqlalchemy.orm import Session

def create_document(db: Session, doc_metadata: dict)->Document:
    db_document = Document(user_id = doc_metadata["user_id"],doc_category = doc_metadata["doc_category"], doc_title = doc_metadata["doc_title"], doc_size = doc_metadata["doc_size"], expiry_date = doc_metadata["expiry_date"], mime_type = doc_metadata["mime_type"], storage_key = doc_metadata["storage_key"])
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document