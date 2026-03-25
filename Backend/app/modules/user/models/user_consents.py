from app.core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func

class User_Consent(Base):
    __tablename__ = "user_consents"

    __table_args__ = (
        UniqueConstraint("user_id", "consent_type", name="unique_user_consent"),
        CheckConstraint("consent_given = TRUE", name="consent_given_true"),
    )

    consent_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(50), nullable=False)
    consent_given = Column(Boolean, nullable=False)
    consent_version = Column(String(20), nullable=False)
    consented_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
