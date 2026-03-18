from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.email_verification_otps import EmailVerificationOTP
from app.core.otp_security import generate_otp, hash_otp

OTP_EXPIRY_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 60
MAX_ATTEMPTS = 5


def get_latest_otp(db: Session, user_id: int):

    return (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.user_id == user_id,
            EmailVerificationOTP.is_used == False
        )
        .order_by(EmailVerificationOTP.created_at.desc())
        .first()
    )


def check_resend_cooldown(otp_record):

    if not otp_record:
        return

    now = datetime.now(timezone.utc)

    if (now - otp_record.last_sent_at).total_seconds() < RESEND_COOLDOWN_SECONDS:
        raise ValueError("Please wait before requesting another verification code.")


def invalidate_previous_otps(db: Session, user_id: int):

    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user_id,
        EmailVerificationOTP.is_used == False
    ).update({"is_used": True})


def create_email_verification_otp(
    db: Session,
    user_id: int,
    new_email: str = None   
):

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_record = EmailVerificationOTP(
        user_id=user_id,
        otp_hash=otp_hash,
        expires_at=expires_at,
        new_email=new_email   
    )

    db.add(otp_record)
    db.flush()

    return otp_record, otp