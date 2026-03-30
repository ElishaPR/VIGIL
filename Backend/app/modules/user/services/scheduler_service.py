from sqlalchemy.orm import Session
from datetime import datetime, timezone
from collections import defaultdict
from dateutil.relativedelta import relativedelta

from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document
from app.modules.user.models.users import User
from app.modules.user.models.user_fcm_tokens import User_FCM_Token

from app.modules.admin.models.notification_logs import NotificationLog

from app.modules.user.services.email_service import send_email
from app.modules.user.services.push_notification_service import send_push_notification


# ---------------- NEXT RUN LOGIC ----------------
def get_next_reminder_time(reminder):

    current_time = reminder.reminder_at

    if reminder.repeat_type == "WEEKLY":
        return current_time + relativedelta(weeks=1)

    if reminder.repeat_type == "MONTHLY":
        return current_time + relativedelta(months=1)

    if reminder.repeat_type == "YEARLY":
        return current_time + relativedelta(years=1)

    return None


# ---------------- MAIN SCHEDULER ----------------
def check_and_send_notifications(db: Session):

    now = datetime.now(timezone.utc)

    # -------- FETCH DUE REMINDERS --------
    reminders = db.query(Reminder).filter(
        Reminder.reminder_at <= now,
        Reminder.reminder_status == "PENDING"
    ).all()

    if not reminders:
        return

    reminder_ids = [r.reminder_id for r in reminders]

    # -------- LOCK THEM (avoid duplicate processing) --------
    db.query(Reminder).filter(
        Reminder.reminder_id.in_(reminder_ids)
    ).update(
        {"reminder_status": "PROCESSING"},
        synchronize_session=False
    )
    db.commit()

    # -------- COLLECT IDS SAFELY --------
    doc_ids = list({r.doc_id for r in reminders if r.doc_id is not None})
    user_ids = list({r.user_id for r in reminders})

    # -------- FETCH DOCUMENTS (OPTIONAL) --------
    doc_map = {}
    if doc_ids:
        documents = db.query(Document).filter(
            Document.doc_id.in_(doc_ids)
        ).all()
        doc_map = {d.doc_id: d for d in documents}

    # -------- FETCH USERS --------
    users = db.query(User).filter(
        User.user_id.in_(user_ids)
    ).all()

    user_email_map = {u.user_id: u.email_address for u in users}

    # -------- FETCH FCM TOKENS --------
    tokens = db.query(User_FCM_Token).filter(
        User_FCM_Token.user_id.in_(user_ids),
        User_FCM_Token.is_active == True
    ).all()

    user_tokens = defaultdict(list)
    for t in tokens:
        user_tokens[t.user_id].append(t.fcm_token)

    # -------- PROCESS EACH REMINDER --------
    for reminder in reminders:

        try:

            user_id = reminder.user_id
            email = user_email_map.get(user_id)

            doc = None
            if reminder.doc_id:
                doc = doc_map.get(reminder.doc_id)

            # -------- EMAIL --------
            if reminder.email_notification and email:
                try:
                    send_email(
                        to_email=email,
                        subject="Vigil Reminder",
                        reminder_title=reminder.reminder_title,
                        reminder_uuid=str(reminder.reminder_uuid)
                    )
                    db.add(NotificationLog(
                        user_id=user_id,
                        reminder_id=reminder.reminder_id,
                        channel="EMAIL",
                        status="SUCCESS",
                        error_message=None
                    ))
                except Exception as e:
                    print("Email failed:", e)
                    db.add(NotificationLog(
                        user_id=user_id,
                        reminder_id=reminder.reminder_id,
                        channel="EMAIL",
                        status="FAILED",
                        error_message=str(e)
                    ))

            # -------- PUSH --------
            if reminder.push_notification:

                fcm_tokens = user_tokens.get(user_id, [])

                for fcm_token in fcm_tokens:
                    try:
                        data = {
                            "reminder_uuid": str(reminder.reminder_uuid),
                            "doc_uuid": str(doc.doc_uuid) if doc else "",
                            "type": "reminder"
                        }

                        send_push_notification(
                            db=db,
                            token=fcm_token,
                            title="Reminder",
                            body=f"{reminder.reminder_title}",
                            reminder_uuid=reminder.reminder_uuid,
                            data=data
                        )
                        db.add(NotificationLog(
                            user_id=user_id,
                            reminder_id=reminder.reminder_id,
                            channel="PUSH",
                            status="SUCCESS",
                            error_message=None
                        ))

                    except Exception as e:
                        print("Push error:", e)
                        db.add(NotificationLog(
                            user_id=user_id,
                            reminder_id=reminder.reminder_id,
                            channel="PUSH",
                            status="FAILED",
                            error_message=str(e)
                        ))

            # -------- REPEAT HANDLING --------
            next_time = get_next_reminder_time(reminder)

            if next_time:
                reminder.reminder_at = next_time
                reminder.reminder_status = "PENDING"
            else:
                reminder.reminder_status = "SENT"

        except Exception as e:
            print("Reminder processing failed:", e)
            reminder.reminder_status = "FAILED"

    db.commit()