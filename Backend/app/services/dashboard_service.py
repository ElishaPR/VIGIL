from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.crud.dashboard import get_user_reminders_dashboard


def calculate_status(expiry_date):

    if not expiry_date:
        return "no_expiry"

    today = datetime.utcnow().date()

    if expiry_date < today:
        return "expired"

    if expiry_date <= today + timedelta(days=30):
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
            title = document.doc_title
            category = document.doc_category.lower()
            expiry = document.expiry_date
        else:
            title = reminder.reminder_title
            category = "general"
            expiry = None

        status = calculate_status(expiry)

        reminders.append({
            "id": reminder.reminder_id,
            "title": title,
            "category": category,
            "expiryDate": expiry,
            "priority": format_priority(reminder.priority),
            "status": status
        })

    return reminders