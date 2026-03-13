from sqlalchemy.orm import Session
from datetime import datetime, timezone
from collections import defaultdict

from app.models.reminders import Reminder
from app.models.documents import Document
from app.models.users import User
from app.models.user_fcm_tokens import User_FCM_Token

from app.services.email_service import send_email
from app.services.push_notification_service import send_push_notification


def check_and_send_notifications(db: Session):

    now = datetime.now(timezone.utc)

    reminders = db.query(Reminder).filter(
        Reminder.reminder_at <= now,
        Reminder.reminder_status == "PENDING"
    ).all()

    if not reminders:
        return

    reminder_ids = [r.reminder_id for r in reminders]

    db.query(Reminder).filter(
        Reminder.reminder_id.in_(reminder_ids)
    ).update(
        {"reminder_status": "PROCESSING"},
        synchronize_session=False
    )

    db.commit()

    doc_ids = list(set([r.doc_id for r in reminders]))

    documents = db.query(Document).filter(
        Document.doc_id.in_(doc_ids)
    ).all()

    doc_map = {d.doc_id: d for d in documents}

    user_ids = list(set([d.user_id for d in documents]))

    users = db.query(User).filter(
        User.user_id.in_(user_ids)
    ).all()

    user_email_map = {u.user_id: u.email_address for u in users}

    tokens = db.query(User_FCM_Token).filter(
        User_FCM_Token.user_id.in_(user_ids),
        User_FCM_Token.is_active == True
    ).all()

    user_tokens = defaultdict(list)

    for t in tokens:
        user_tokens[t.user_id].append(t.fcm_token)

    for reminder in reminders:

        doc = doc_map.get(reminder.doc_id)

        if not doc:
            continue

        user_id = doc.user_id

        email = user_email_map.get(user_id)

        # -------- EMAIL --------

        if reminder.email_notification and email:

            try:

                send_email(
                    to_email=email,
                    subject="Vigil Document Reminder",
                    reminder_title=reminder.reminder_title,
                    reminder_uuid=str(reminder.reminder_uuid)
                )

            except Exception as e:

                print("Email failed:", e)

        # -------- PUSH --------

        if reminder.push_notification:

            tokens = user_tokens.get(user_id, [])

            for token in tokens:

                try:

                    send_push_notification(
                        token=token,
                        title="Document Reminder",
                        body=f"Your {reminder.reminder_title} is due",
                        data={
                            "reminder_id": reminder.reminder_id,
                            "doc_id": reminder.doc_id,
                            "type": "reminder"
                        }
                    )

                except Exception as e:

                    print("Push error:", e)

        reminder.reminder_status = "SENT"

    db.commit()