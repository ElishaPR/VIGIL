import firebase_admin
from app.crud.user_fcm_tokens import create_fcm_token
from sqlalchemy.orm import Session
from app.schemas.users import SaveFCMTokenData
from app.models.user_fcm_tokens import User_FCM_Token
from firebase_admin import messaging

def save_user_fcm_token(db: Session, save_fcm_token_data: SaveFCMTokenData, user_id: int)->User_FCM_Token:
    token_data = {"user_id": user_id, "fcm_token": save_fcm_token_data.fcm_token}
    return create_fcm_token(db, token_data)

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