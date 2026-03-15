from sqlalchemy.orm import Session
from app.models.reminders import Reminder
from app.models.documents import Document


def get_user_reminders_dashboard(db: Session, user_id: int):

    reminders = (
        db.query(Reminder, Document)
        .join(Document, Reminder.doc_id == Document.doc_id)
        .filter(Document.user_id == user_id)
        .all()
    )

    return reminders