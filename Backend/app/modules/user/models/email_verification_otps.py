from app.core.database import Base
from sqlalchemy import Column, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import CITEXT


class EmailVerificationOTP(Base):
    __tablename__ = "email_verification_otps"

    otp_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    otp_hash = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, nullable=False, server_default=func.false())
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    attempts = Column(Integer, nullable=False, server_default="0")
    last_sent_at = Column(DateTime(timezone=True), nullable=True, server_default=func.now())
    new_email = Column(CITEXT, nullable=True)