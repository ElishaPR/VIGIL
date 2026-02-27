from app.models.user_fcm_tokens import User_FCM_Token
from sqlalchemy.orm import Session

def create_fcm_token(db: Session, token_data: dict)->User_FCM_Token:
    db_user_fcm_token = User_FCM_Token(user_id = token_data["user_id"], fcm_token = token_data["fcm_token"])
    db.add(db_user_fcm_token)
    db.commit()
    db.refresh(db_user_fcm_token)
    return db_user_fcm_token 

def fetch_fcm_tokens(db: Session, user_ids: list):
    if not user_ids:
        return []
    fcm_tokens = (db.query(User_FCM_Token.user_id, User_FCM_Token.fcm_token, User_FCM_Token.is_active)).filter(User_FCM_Token.user_id.in_(user_ids), User_FCM_Token.is_active == True).all()
    return [{"user_id": r.user_id, "fcm_token": r.fcm_token} for r in fcm_tokens]