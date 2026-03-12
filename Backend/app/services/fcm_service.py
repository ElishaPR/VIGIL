from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.crud.user_fcm_tokens import (
    save_fcm_token,
    get_active_tokens
)


def register_fcm_token(
    db: Session,
    user_id: int,
    token: str
):

    if not token or len(token) < 10:
        raise HTTPException(
            status_code=400,
            detail="Invalid FCM token"
        )

    return save_fcm_token(
        db=db,
        user_id=user_id,
        token=token
    )


def get_user_tokens(
    db: Session,
    user_id: int
):

    return get_active_tokens(
        db=db,
        user_id=user_id
    )