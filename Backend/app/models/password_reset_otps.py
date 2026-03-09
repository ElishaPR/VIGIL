from app.database import Base
from sqlalchemy import Column, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func


class PasswordResetOTP(Base):

    __tablename__ = "password_reset_otps"

    otp_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    otp_hash = Column(Text, nullable=False)

    expires_at = Column(DateTime(timezone=True), nullable=False)

    is_used = Column(Boolean, nullable=False, server_default=func.false())

    attempts = Column(Integer, nullable=False, server_default="0")

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    last_sent_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )