from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document


def get_user_reminders_dashboard(db: Session, user_id: int):

    reminders = (
        db.query(Reminder, Document)
        .outerjoin(
            Document,
            Reminder.doc_id == Document.doc_id
        )
        .filter(Reminder.user_id == user_id)
        .order_by(Reminder.reminder_at.asc())
        .all()
    )

    return reminders