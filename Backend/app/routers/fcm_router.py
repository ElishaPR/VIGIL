from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.fcm_token_schema import SaveFCMTokenRequest, FCMTokenResponse
from app.services.fcm_service import register_fcm_token
from app.models.users import User


router = APIRouter(
    prefix="/fcm",
    tags=["FCM"]
)


@router.post("/register", response_model=FCMTokenResponse)
def register_token(
    data: SaveFCMTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends()
):

    register_fcm_token(
        db,
        current_user.user_id,
        data.fcm_token
    )

    return {"message": "FCM token saved"}