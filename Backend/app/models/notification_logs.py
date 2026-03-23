from app.database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    reminder_id = Column(Integer, ForeignKey("reminders.reminder_id", ondelete="SET NULL"), nullable=True)
    channel = Column(String(10), nullable=False)
    status = Column(String(10), nullable=False)
    error_message = Column(Text, nullable=True)
    attempted_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
