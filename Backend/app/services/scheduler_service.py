from sqlalchemy.orm import Session
from app.crud.reminders import get_not_sent_reminder_ids, mark_reminders_as_processing, fetch_reminder_details
from app.crud.documents import fetch_document_details
from app.crud.users import fetch_user_details
from app.crud.user_fcm_tokens import fetch_fcm_tokens
from app.services.user_fcm_token_service import send_push_notification

def check_and_send_notifications(db: Session):
    reminder_ids = list(get_not_sent_reminder_ids(db))

    if not reminder_ids:
        return  
    
    mark_reminders_as_processing(db, reminder_ids)
    
    reminder_details = fetch_reminder_details(db, reminder_ids)
    doc_ids = reminder_details["doc_ids"]
    reminders = reminder_details["reminders"]
    
    doc_details = fetch_document_details(db, doc_ids)
    user_ids = doc_details["user_ids"]
    documents = doc_details["documents"]

    user_details = fetch_user_details(db, user_ids)
    fcm_tokens = fetch_fcm_tokens(db, user_ids)
    # send_email_notifications()
    push_reminders = [
        r for r in reminders
        if r["push_notification"] and r["reminder_status"] == "PROCESSING"
    ]

    send_push_notification()
    