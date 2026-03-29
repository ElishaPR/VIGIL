from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.modules.user.crud.dashboard import get_user_reminders_dashboard


def calculate_status(reminder_at):

    if not reminder_at:
        return "active"

    today = datetime.now(timezone.utc)

    if reminder_at < today:
        return "expired"

    if reminder_at <= today + timedelta(days=3):
        return "expiring"

    return "active"


def format_priority(priority: str):

    if not priority:
        return "medium"

    return priority.lower()


def get_dashboard_reminders_service(db: Session, user_id: int):

    rows = get_user_reminders_dashboard(db, user_id)

    reminders = []

    for reminder, document in rows:

        if document:
            title = reminder.reminder_title or document.doc_title
            category = document.doc_category.lower()
        else:
            title = reminder.reminder_title
            category = "general"

        status = calculate_status(reminder.reminder_at)

        reminders.append({
            "reminder_uuid": str(reminder.reminder_uuid),
            "title": title,
            "category": category,
            "reminder_at": (
                reminder.reminder_at.replace(tzinfo=timezone.utc).isoformat()
                if reminder.reminder_at else None
            ),
            "priority": format_priority(reminder.priority),
            "status": status,
            "push_notification": reminder.push_notification,
            "email_notification": reminder.email_notification,
        })

    return reminders