from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError

from app.models.user_fcm_tokens import User_FCM_Token


def save_fcm_token(
    db: Session,
    user_id: int,
    token: str
):

    existing = db.query(User_FCM_Token).filter(
        User_FCM_Token.fcm_token == token
    ).first()

    if existing:

        existing.user_id = user_id
        existing.is_active = True
        existing.last_push_status = None
        existing.last_attempted_at = None

        db.commit()
        db.refresh(existing)

        return existing

    token_obj = User_FCM_Token(
        user_id=user_id,
        fcm_token=token,
        is_active=True
    )

    try:

        db.add(token_obj)
        db.commit()
        db.refresh(token_obj)

        return token_obj

    except IntegrityError:

        db.rollback()

        existing = db.query(User_FCM_Token).filter(
            User_FCM_Token.fcm_token == token
        ).first()

        return existing
    
def get_active_tokens(
    db: Session,
    user_id: int
):

    return db.query(User_FCM_Token).filter(
        User_FCM_Token.user_id == user_id,
        User_FCM_Token.is_active == True
    ).all()

def update_push_status(
    db: Session,
    token: str,
    status: str
):

    token_obj = db.query(User_FCM_Token).filter(
        User_FCM_Token.fcm_token == token
    ).first()

    if not token_obj:
        return

    token_obj.last_push_status = status
    token_obj.last_attempted_at = func.now()

    if status == "FAILED":
        token_obj.is_active = False

    db.commit()