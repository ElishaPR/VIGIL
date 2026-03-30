from datetime import datetime, timedelta, timezone, date as date_type
from sqlalchemy.orm import Session

from app.modules.user.crud.dashboard import get_user_reminders_dashboard


def calculate_status(expiry_date, reminder_at):

    today_utc = datetime.now(timezone.utc)
    today_date = today_utc.date()

    # Prefer document expiry_date for status (actual document deadline)
    if expiry_date:
        if expiry_date < today_date:
            return "expired"
        if expiry_date <= today_date + timedelta(days=3):
            return "expiring"
        return "active"

    # Fall back to reminder_at when no document expiry exists
    if not reminder_at:
        return "no_expiry"

    if reminder_at < today_utc:
        return "expired"

    if reminder_at <= today_utc + timedelta(days=3):
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
            expiry_date = document.expiry_date
        else:
            title = reminder.reminder_title
            category = "general"
            expiry_date = None

        reminder_at_aware = None
        if reminder.reminder_at:
            reminder_at_aware = reminder.reminder_at.replace(tzinfo=timezone.utc)

        status = calculate_status(expiry_date, reminder_at_aware)

        reminders.append({
            "reminder_uuid": str(reminder.reminder_uuid),
            "title": title,
            "category": category,
            "expiry_date": expiry_date.isoformat() if expiry_date else None,
            "reminder_at": reminder_at_aware.isoformat() if reminder_at_aware else None,
            "priority": format_priority(reminder.priority),
            "status": status,
            "push_notification": reminder.push_notification,
            "email_notification": reminder.email_notification,
        })

    return reminders