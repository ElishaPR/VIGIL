from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user_payload
from app.models.users import User


def require_verified_user(
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user_payload)
):

    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(404, "User not found.")

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before accessing this feature."
        )

    return user