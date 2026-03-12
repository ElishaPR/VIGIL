from sqlalchemy.orm import Session
from app.models.user_fcm_tokens import UserFCMToken


def save_fcm_token(db: Session, user_id: int, token: str):

    existing = db.query(UserFCMToken).filter(
        UserFCMToken.fcm_token == token
    ).first()

    if existing:
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    token_obj = UserFCMToken(
        user_id=user_id,
        fcm_token=token
    )

    db.add(token_obj)
    db.commit()
    db.refresh(token_obj)

    return token_obj


def get_active_tokens(db: Session, user_id: int):

    return db.query(UserFCMToken).filter(
        UserFCMToken.user_id == user_id,
        UserFCMToken.is_active == True
    ).all()