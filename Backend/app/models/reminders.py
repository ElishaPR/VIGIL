from app.database import Base
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func 

class Reminder(Base):
    __tablename__ = "reminders"

    reminder_id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.doc_id"), nullable=False)
    __table_args__ = (
        UniqueConstraint("doc_id", name="reminders_doc_id_key"),
        )
    schedule_type = Column(String(15), nullable=False)
    reminder_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True),nullable=False, server_default=func.now())
    email_notification = Column(Boolean, nullable=False, server_default=func.true())
    push_notification = Column(Boolean, nullable=False, server_default=func.false())
    reminder_title = Column(String(100), nullable=False)
    repeat_type = Column(String(10), nullable=False, server_default="NONE")
    priority = Column(String(10), nullable=False, server_default="MEDIUM")
    notes = Column(Text)
    reminder_uuid = Column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, unique=True)
    reminder_status = Column(String(20), nullable=False, server_default="PENDING")
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())