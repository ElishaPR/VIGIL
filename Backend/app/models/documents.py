from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

class Document(Base):
    __tablename__ = "documents"

    doc_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    doc_uuid = Column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, unique=True)
    doc_category = Column(String(25), nullable=False)
    doc_title = Column(String(50), nullable=False)
    doc_size = Column(BigInteger, nullable=False)
    expiry_date = Column(Date, nullable=False)
    mime_type = Column(Text, nullable=False)
    storage_key = Column(Text, nullable=False, unique=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())