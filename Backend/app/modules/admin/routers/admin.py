from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User
from app.modules.admin.models.notification_logs import NotificationLog
from app.modules.user.models.reminders import Reminder
from app.core.config import settings


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/notifications")
def get_notification_logs(
    status: str | None = Query(None, description="Filter by status: SUCCESS or FAILED"),
    channel: str | None = Query(None, description="Filter by channel: EMAIL or PUSH"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns paginated notification logs.
    Accessible to any authenticated user.
    Filter by status (SUCCESS/FAILED) and/or channel (EMAIL/PUSH).
    """
    if current_user.email_address.lower() != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Admin access required")

    query = (
        db.query(
            NotificationLog.log_id,
            NotificationLog.channel,
            NotificationLog.status,
            NotificationLog.error_message,
            NotificationLog.attempted_at,
            User.email_address,
            Reminder.reminder_title,
            Reminder.reminder_uuid
        )
        .join(User, NotificationLog.user_id == User.user_id, isouter=True)
        .join(Reminder, NotificationLog.reminder_id == Reminder.reminder_id, isouter=True)
    )

    if status:
        status_upper = status.upper()
        if status_upper not in ("SUCCESS", "FAILED"):
            raise HTTPException(400, "status must be SUCCESS or FAILED")
        query = query.filter(NotificationLog.status == status_upper)

    if channel:
        channel_upper = channel.upper()
        if channel_upper not in ("EMAIL", "PUSH"):
            raise HTTPException(400, "channel must be EMAIL or PUSH")
        query = query.filter(NotificationLog.channel == channel_upper)

    total = query.count()
    total_failed = db.query(NotificationLog).filter(NotificationLog.status == "FAILED").count()

    offset = (page - 1) * page_size
    rows = (
        query
        .order_by(NotificationLog.attempted_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    logs = []
    for row in rows:
        logs.append({
            "channel": row.channel,
            "status": row.status,
            "error_message": row.error_message,
            "attempted_at": row.attempted_at.isoformat() if row.attempted_at else None,
            "user_email": row.email_address,
            "reminder_title": row.reminder_title,
            "reminder_uuid": str(row.reminder_uuid) if row.reminder_uuid else None,
        })

    return {
        "total": total,
        "total_failed": total_failed,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
        "logs": logs
    }
