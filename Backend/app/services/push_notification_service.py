import firebase_admin
from firebase_admin import messaging

from app.crud.user_fcm_tokens import update_push_status


def send_push_notification(
    db,
    token: str,
    title: str,
    body: str,
    reminder_uuid: str
):

    message = messaging.Message(

        token=token,

        notification=messaging.Notification(
            title=title,
            body=body,
            image="https://vigil-placeholder.app/logo.png"
        ),

        data={
            "reminder_uuid": reminder_uuid,
            "type": "reminder",
            "url": f"https://vigil-placeholder.app/reminder/{reminder_uuid}"
        }
    )

    try:

        messaging.send(message)

        update_push_status(db, token, "SUCCESS")

        print("Push sent")

    except Exception as e:

        update_push_status(db, token, "FAILED")

        print("Push failed:", e)