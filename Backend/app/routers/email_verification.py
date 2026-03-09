from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from datetime import datetime, timezone

from app.database import get_db

from app.schemas.email_verification_otps import (
    VerifyEmailOTPData,
    VerifyEmailOTPResponse,
    ResendOTPResponse
)

from app.crud.email_verification_otps import (
    get_latest_otp,
    create_email_verification_otp,
    invalidate_previous_otps,
    check_resend_cooldown,
    MAX_ATTEMPTS
)

from app.services.email_verification_service import send_verification_email

from app.core.otp_security import verify_otp
from app.core.security import get_current_user_payload

from app.models.users import User


router = APIRouter(prefix="/email-verification", tags=["Email Verification"])


@router.post("/send", response_model=ResendOTPResponse)
def send_email_verification(
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user_payload)
):

    user = db.query(User).filter(User.user_id == token_data["user_id"]).first()

    if not user:
        raise HTTPException(404, "User not found.")

    if user.email_verified:
        raise HTTPException(400, "Email already verified.")

    latest_otp = get_latest_otp(db, user.user_id)

    try:
        check_resend_cooldown(latest_otp)
    except ValueError as e:
        raise HTTPException(429, str(e))

    try:

        with db.begin():

            invalidate_previous_otps(db, user.user_id)

            otp_record, otp = create_email_verification_otp(
                db,
                user.user_id
            )

        send_verification_email(
            user.email_address,
            user.display_name,
            otp
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(500, "Database error occurred.")

    except RuntimeError as e:
        raise HTTPException(500, str(e))

    return ResendOTPResponse()


@router.post("/verify", response_model=VerifyEmailOTPResponse)
def verify_email(
    data: VerifyEmailOTPData,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user_payload)
):

    user = db.query(User).filter(User.user_id == token_data["user_id"]).first()

    if not user:
        raise HTTPException(404, "User not found.")

    otp_record = get_latest_otp(db, user.user_id)

    if not otp_record:
        raise HTTPException(400, "No verification code found.")

    if otp_record.attempts >= MAX_ATTEMPTS:
        raise HTTPException(403, "Too many failed attempts.")

    if datetime.now(timezone.utc) > otp_record.expires_at:
        raise HTTPException(400, "Verification code expired.")

    if not verify_otp(data.otp, otp_record.otp_hash):

        with db.begin():
            otp_record.attempts += 1

        raise HTTPException(400, "Invalid verification code.")

    try:

        with db.begin():

            otp_record.is_used = True
            user.email_verified = True

    except IntegrityError:
        db.rollback()
        raise HTTPException(500, "Database error occurred.")

    return VerifyEmailOTPResponse()