from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

class User_Consent(Base):
    __tablename__ = "user_consents"

    consent_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    consent_type = Column(String(50), nullable=False)
    consent_given = Column(Boolean, nullable=False)
    consent_version = Column(String(20), nullable=False)
    consented_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
