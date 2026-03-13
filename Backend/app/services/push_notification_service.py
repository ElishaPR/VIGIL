import firebase_admin
from firebase_admin import messaging

from app.crud.user_fcm_tokens import update_push_status


def send_push_notification(token: str, title: str, body: str, data: dict = None):
    try:
        print(f"\n=== DEBUG: Sending push to token: {token[:50]}... ===")
        
        if not firebase_admin._apps:
            print("Firebase app not initialized!")
            return
        
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
        
        response = messaging.send(message)
        print(f"Push sent successfully! Message ID: {response}")
        
    except Exception as e:  
        print(f"Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise    