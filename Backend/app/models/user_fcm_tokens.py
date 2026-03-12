from app.database import Base
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.sql import func

class User_FCM_Token(Base):
    __tablename__ = "user_fcm_tokens"

    __table_args__ = (
    CheckConstraint(
        "last_push_status IN ('SUCCESS','FAILED')",
        name="check_last_push_status"
    ),
    )

    fcm_token_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    fcm_token = Column(Text, nullable=False, unique=True)
    is_active = Column(Boolean, nullable=False, server_default=func.true())
    last_push_status = Column(String(20))
    last_attempted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())