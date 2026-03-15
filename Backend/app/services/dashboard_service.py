from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.crud.dashboard import get_user_reminders_dashboard


def calculate_status(expiry_date):

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

        status = calculate_status(document.expiry_date)

        reminders.append({
            "id": reminder.reminder_id,
            "title": document.doc_title,
            "category": document.doc_category.lower(),
            "expiryDate": document.expiry_date,
            "priority": format_priority(reminder.priority),
            "status": status
        })

    return reminders