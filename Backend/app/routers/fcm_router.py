from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.fcm_token_schema import (
    SaveFCMTokenRequest,
    FCMTokenResponse
)

from app.services.fcm_service import register_fcm_token

from app.models.users import User
from app.dependencies.auth_cookie import get_current_user


router = APIRouter(
    prefix="/fcm",
    tags=["FCM"]
)


@router.post(
    "/register",
    response_model=FCMTokenResponse
)
def register_token(
    data: SaveFCMTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    register_fcm_token(
        db=db,
        user_id=current_user.user_id,
        token=data.fcm_token
    )

    return {
        "message": "FCM token saved"
    }