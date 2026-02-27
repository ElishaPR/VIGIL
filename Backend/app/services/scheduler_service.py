from sqlalchemy.orm import Session
from app.crud.reminders import get_not_sent_reminder_ids, mark_reminders_as_processing, fetch_reminder_details
from app.crud.documents import fetch_document_details
from app.crud.users import fetch_user_details
from app.crud.user_fcm_tokens import fetch_fcm_tokens
from app.services.user_fcm_token_service import send_push_notification
from collections import defaultdict

def check_and_send_notifications(db: Session):
    reminder_ids = list(get_not_sent_reminder_ids(db))

    if not reminder_ids:
        return  
    
    mark_reminders_as_processing(db, reminder_ids)
    
    reminders = fetch_reminder_details(db, reminder_ids)

    doc_ids = [r["doc_id"] for r in reminders]
    
    documents = fetch_document_details(db, doc_ids)

    doc_to_user = {doc["doc_id"]: doc["user_id"] for doc in documents}

    user_ids = list(set(doc_to_user.values()))
    
    fcm_tokens = fetch_fcm_tokens(db, user_ids)

    user_to_tokens = defaultdict(list)
    for item in fcm_tokens:
        user_to_tokens[item["user_id"]].append(item["fcm_token"])

    push_reminders = [r for r in reminders if r["push_notification"] and r["reminder_status"] == "PROCESSING"]

    for reminder in push_reminders:

        user_id = doc_to_user.get(reminder["doc_id"])
        if not user_id:
            continue

        tokens = user_to_tokens.get(user_id, [])

        for token in tokens:
            try:
                send_push_notification(token=token, title="Document Reminder", body=f"Your {reminder['reminder_title']} is due", data={"reminder_id": reminder["reminder_id"], "doc_id": reminder["doc_id"], "type": "reminder"})
            except Exception as e:
                print ("Push failed:", e)     