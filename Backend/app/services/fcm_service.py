from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.crud.user_fcm_tokens import save_fcm_token


def register_fcm_token(
    db: Session,
    user_id: int,
    token: str
):

    if len(token) < 10:
        raise HTTPException(
            status_code=400,
            detail="Invalid FCM token"
        )

    return save_fcm_token(db, user_id, token)