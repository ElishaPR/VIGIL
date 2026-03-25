import firebase_admin
from firebase_admin import messaging

from app.modules.user.crud.user_fcm_tokens import update_push_status


def send_push_notification(
    db,
    token: str,
    title: str,
    body: str,
    reminder_uuid: str,
    data: dict = None
):

    string_data = {}
    if data:
        for key, value in data.items():
            string_data[key] = str(value)
            
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=string_data,
        token=token,
        webpush=messaging.WebpushConfig(
            headers={
                "Urgency": "high"
            }
        )
    )

    try:

        response = messaging.send(message)
        print("Push sent:", response)

        update_push_status(db, token, "SUCCESS")

    except Exception as e:

        update_push_status(db, token, "FAILED")

        print("Push failed:", e)