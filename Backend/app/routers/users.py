from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

from app.database import get_db

from app.models.users import User

from app.schemas.users import (
    ChangeEmailData,
    ChangeEmailResponse,
    ChangePasswordData,
    ChangePasswordResponse,
    SignUpData,
    SignUpUserResponse,
    LoginData,
    LoginUserResponse,
    UserProfileResponse,
    UpdateProfileData,
    UpdateProfileResponse
)

from app.schemas.email_verification_otps import VerifyEmailOTPData

from app.crud.users import create_user, authenticate_user
from app.crud.user_consents import create_user_consents
from app.crud.email_verification_otps import (
    create_email_verification_otp,
    invalidate_previous_otps,
    get_latest_otp,
    check_resend_cooldown,
    MAX_ATTEMPTS
)

from app.core.security import (
    create_access_token,
    ACCESS_TOKEN_EXPIRE_SECONDS,
    get_current_user_payload,
    verify_password,
    password_hashing
)

from app.core.otp_security import verify_otp
from app.services.email_verification_service import send_verification_email


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/signup", response_model=SignUpUserResponse, status_code=201)
def signup(
    signup_data: SignUpData,
    response: Response,
    db: Session = Depends(get_db)
):

    if not signup_data.india_resident:
        raise HTTPException(
            status_code=400,
            detail="You must confirm that you reside in India."
        )

    if not signup_data.document_processing:
        raise HTTPException(
            status_code=400,
            detail="You must consent to document processing."
        )

    if not signup_data.terms_of_service:
        raise HTTPException(
            status_code=400,
            detail="You must agree to the Terms of Service."
        )

    try:
        # create_user uses flush() so no commit yet — session auto-begins
        user = create_user(db, signup_data)
        create_user_consents(db, user.user_id)
        invalidate_previous_otps(db, user.user_id)
        otp_record, otp = create_email_verification_otp(db, user.user_id)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email address already exists."
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Signup failed."
        )

    try:
        send_verification_email(
            user.email_address,
            user.display_name,
            otp
        )
    except Exception:
        pass  # email failure should not prevent signup

    access_token = create_access_token({
        "user_id": user.user_id,
        "user_uuid": str(user.user_uuid),
        "email": user.email_address,
        "type": "access"
    })

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_SECONDS
    )

    return SignUpUserResponse(
        user_uuid=str(user.user_uuid),
        display_name=user.display_name
    )


@router.post("/login", response_model=LoginUserResponse, status_code=200)
def login(
    login_data: LoginData,
    response: Response,
    db: Session = Depends(get_db)
):

    user = authenticate_user(db, login_data)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not user.email_verified:

        try:
            invalidate_previous_otps(db, user.user_id)
            otp_record, otp = create_email_verification_otp(db, user.user_id)
            db.commit()

            send_verification_email(
                user.email_address,
                user.display_name,
                otp
            )

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to send verification email."
            )

        response.delete_cookie("access_token")

        raise HTTPException(
            status_code=403,
            detail="Please verify your email."
        )

    # Single token creation for verified users (B8 fix)
    access_token = create_access_token({
        "user_id": user.user_id,
        "user_uuid": str(user.user_uuid),
        "email": user.email_address,
        "type": "access"
    })

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_SECONDS
    )

    return LoginUserResponse(
        user_uuid=str(user.user_uuid),
        display_name=user.display_name
    )


@router.post("/logout", status_code=200)
def logout(response: Response):

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax"
    )

    return {"message": "Logged out successfully."}


@router.post("/logout-all", status_code=200)
def logout_all(response: Response):
    """
    Logs out from all devices by clearing the current session cookie.
    A full multi-device logout would require a token blacklist table in the DB.
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax"
    )

    return {"message": "Logged out from all devices."}


@router.get("/me", response_model=UserProfileResponse)
def get_current_user(
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "user_uuid": str(user.user_uuid),
        "display_name": user.display_name,
        "email_address": user.email_address
    }


@router.put("/me", response_model=UpdateProfileResponse)
def update_profile(
    data: UpdateProfileData,
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(404, "User not found")

    user.display_name = data.display_name
    db.commit()

    return UpdateProfileResponse()


@router.post("/change-email/request")
def request_change_email(
    data: ChangeEmailData,
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(404, "User not found")

    existing = db.query(User).filter(
        User.email_address == data.new_email_address
    ).first()

    if existing:
        raise HTTPException(409, "Email already in use.")

    latest_otp = get_latest_otp(db, user.user_id)
    if latest_otp:
        try:
            check_resend_cooldown(latest_otp)
        except ValueError as e:
            raise HTTPException(429, str(e))

    try:
        invalidate_previous_otps(db, user.user_id)
        otp_record, otp = create_email_verification_otp(
            db, user.user_id, new_email=data.new_email_address
        )
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"DB error: {str(e)}")

    try:
        send_verification_email(data.new_email_address, user.display_name, otp)
    except Exception as e:
        raise HTTPException(500, f"Email failed: {str(e)}")

    return {"message": "OTP sent to new email"}


@router.post("/change-email/verify")
def verify_change_email(
    data: VerifyEmailOTPData,
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(404, "User not found")

    otp_record = get_latest_otp(db, user.user_id)

    if not otp_record:
        raise HTTPException(400, "No OTP found")

    if not otp_record.new_email:
        raise HTTPException(400, "Invalid OTP data")

    if otp_record.is_used:
        raise HTTPException(400, "OTP already used")

    if otp_record.attempts >= MAX_ATTEMPTS:
        raise HTTPException(403, "Too many attempts")

    if datetime.now(timezone.utc) > otp_record.expires_at:
        raise HTTPException(400, "OTP expired")

    if not verify_otp(data.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(400, "Invalid OTP")

    try:
        user.email_address = otp_record.new_email
        user.email_verified = True
        otp_record.is_used = True
        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Email already exists")

    return {"message": "Email updated successfully"}


@router.put("/me/change-password", response_model=ChangePasswordResponse)
def change_password(
    data: ChangePasswordData,
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(404, "User not found")

    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect."
        )

    if verify_password(data.new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the current password."
        )

    try:
        user.hashed_password = password_hashing(data.new_password)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Password change failed."
        )

    return ChangePasswordResponse()