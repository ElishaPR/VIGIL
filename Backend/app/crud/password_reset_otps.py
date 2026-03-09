from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.password_reset_otps import PasswordResetOTP
from app.core.otp_security import generate_otp, hash_otp


OTP_EXPIRY_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 60
MAX_ATTEMPTS = 5


def get_latest_reset_otp(db: Session, user_id: int):

    return (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user_id,
            PasswordResetOTP.is_used == False
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )


def invalidate_previous_reset_otps(db: Session, user_id: int):

    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user_id,
        PasswordResetOTP.is_used == False
    ).update({"is_used": True})


def check_resend_cooldown(otp_record):

    if not otp_record:
        return

    now = datetime.now(timezone.utc)

    if (now - otp_record.last_sent_at).total_seconds() < RESEND_COOLDOWN_SECONDS:
        raise ValueError("Please wait before requesting another reset code.")


def create_password_reset_otp(db: Session, user_id: int):

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_record = PasswordResetOTP(
        user_id=user_id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    db.add(otp_record)
    db.flush()

    return otp_record, otp