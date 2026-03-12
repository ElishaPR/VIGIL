from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from jose import jwt
import os

from app.database import get_db
from app.models.users import User
from app.core.config import settings

JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM=os.getenv("JWT_ALGORITHM")

if not JWT_SECRET_KEY:
     raise RuntimeError("JWT_SECRET_KEY is not set.")

if not JWT_ALGORITHM:
     raise RuntimeError("JWT_ALGORITHM is not set.")

def get_current_user(
        request: Request,
        db: Session = Depends(get_db)
):

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(401, "Not authenticated")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")
    except:
        raise HTTPException(401, "Invalid token")

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(401, "User not found")

    return user