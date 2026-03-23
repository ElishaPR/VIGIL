from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.users import User
from app.core.security import password_hashing
from app.core.otp_security import verify_otp

from app.schemas.password_reset import *

from app.crud.password_reset_otps import (
    get_latest_reset_otp,
    create_password_reset_otp,
    invalidate_previous_reset_otps,
    check_resend_cooldown,
    MAX_ATTEMPTS
)

from app.services.password_reset_service import send_password_reset_email


router = APIRouter(prefix="/password-reset", tags=["Password Reset"])


@router.post("/forgot", response_model=ForgotPasswordResponse)
def forgot_password(data: ForgotPasswordData, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email_address == data.email_address
    ).first()

    if not user:
        return ForgotPasswordResponse()

    latest = get_latest_reset_otp(db, user.user_id)

    try:
        check_resend_cooldown(latest)
    except ValueError:
        return ForgotPasswordResponse()

    try:
        invalidate_previous_reset_otps(db, user.user_id)
        otp_record, otp = create_password_reset_otp(db, user.user_id)
        db.commit()

        send_password_reset_email(
            user.email_address,
            user.display_name,
            otp
        )

    except Exception as e:
        print("Password reset email error:", e)

    return ForgotPasswordResponse()


@router.post("/verify", response_model=VerifyResetOTPResponse)
def verify_reset_otp(data: VerifyResetOTPData, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email_address == data.email_address
    ).first()

    if not user:
        raise HTTPException(400, "Invalid request.")

    otp_record = get_latest_reset_otp(db, user.user_id)

    if not otp_record:
        raise HTTPException(400, "No reset code found.")

    # B15: check is_used before verifying
    if otp_record.is_used:
        raise HTTPException(400, "Reset code already used.")

    if otp_record.attempts >= MAX_ATTEMPTS:
        raise HTTPException(403, "Too many attempts.")

    # B7 fix: check expiry BEFORE hash verify
    if datetime.now(timezone.utc) > otp_record.expires_at:
        raise HTTPException(400, "Reset code expired.")

    if not verify_otp(data.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(400, "Invalid code.")

    return VerifyResetOTPResponse()


@router.post("/reset", response_model=ResetPasswordResponse)
def reset_password(data: ResetPasswordData, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email_address == data.email_address
    ).first()

    if not user:
        raise HTTPException(400, "Invalid request.")

    otp_record = get_latest_reset_otp(db, user.user_id)

    if not otp_record:
        raise HTTPException(400, "Invalid request.")

    # B15: check is_used
    if otp_record.is_used:
        raise HTTPException(400, "Reset code already used.")

    # B7 fix: expiry check + is_used check BEFORE hash verify
    if datetime.now(timezone.utc) > otp_record.expires_at:
        raise HTTPException(400, "Reset code expired.")

    if not verify_otp(data.otp, otp_record.otp_hash):
        raise HTTPException(400, "Invalid code.")

    try:
        user.hashed_password = password_hashing(data.new_password)
        otp_record.is_used = True
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(500, "Password reset failed.")

    return ResetPasswordResponse()