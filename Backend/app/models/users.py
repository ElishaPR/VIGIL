from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, CITEXT
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, unique=True)
    email_address = Column(CITEXT, nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True),nullable=False, server_default=func.now())
    is_india_resident = Column(Boolean, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())