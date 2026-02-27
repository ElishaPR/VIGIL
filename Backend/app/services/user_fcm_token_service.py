from app.crud.user_fcm_tokens import create_fcm_token
from sqlalchemy.orm import Session
from app.schemas.users import SaveFCMTokenData
from app.models.user_fcm_tokens import User_FCM_Token
from firebase_admin import messaging

def save_user_fcm_token(db: Session, save_fcm_token_data: SaveFCMTokenData, user_id: int)->User_FCM_Token:
    token_data = {"user_id": user_id, "fcm_token": save_fcm_token_data.fcm_token}
    return create_fcm_token(db, token_data)

def send_push_notification(token: str, title: str, body: str, data: dict):
    message = messaging.Message(notification=messaging.Notification(title=title, body=body,), data={k: str(v) for k, v in data.items()}, token=token)
    response = messaging.send(message)
    return response    