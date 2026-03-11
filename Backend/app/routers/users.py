from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db

from app.models.users import User

from app.schemas.users import (
    SignUpData,
    SignUpUserResponse,
    LoginData,
    LoginUserResponse,
    UpdateProfileData,
    UpdateProfileResponse
)

from app.crud.users import create_user, authenticate_user
from app.crud.user_consents import create_user_consents
from app.crud.email_verification_otps import (
    create_email_verification_otp,
    invalidate_previous_otps
)

from app.core.security import (
    create_access_token,
    ACCESS_TOKEN_EXPIRE_SECONDS,
    get_current_user_payload
)


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

        with db.begin():

            user = create_user(db, signup_data)

            create_user_consents(db, user.user_id)

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
            secure=False,  # True in production
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_SECONDS
        )

        return SignUpUserResponse(
            user_uuid=str(user.user_uuid),
            display_name=user.display_name
        )

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

    if not user.email_verified:

        try:

            invalidate_previous_otps(db, user.user_id)

            otp_record, otp = create_email_verification_otp(
                db,
                user.user_id
            )

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

        response.status_code = 403

        return LoginUserResponse(
            access_token="",
            user_uuid=str(user.user_uuid),
            display_name=user.display_name
        )
    
    return LoginUserResponse(
        access_token=access_token,
        user_uuid=str(user.user_uuid),
        display_name=user.display_name
    )

@router.post("/logout", status_code=200)
def logout(response: Response):

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,  # change to True in production
        samesite="lax"
    )

    return {
        "message": "Logged out successfully."
    }

@router.get("/me", response_model=UpdateProfileResponse)
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

@router.put("/me")
def update_profile(
    data: UpdateProfileData,
    token_data: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.user_id == token_data["user_id"]
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.display_name = data.display_name

    db.commit()

    return {
        "message": "Profile updated successfully"
    }


# @router.post("/save-fcm-token", response_model=SaveFCMTokenResponse)
# def save_fcm_token(
#         save_fcm_token_data: SaveFCMTokenData,
#         db: Session = Depends(get_db),
#         token_data: dict = Depends(get_current_user_payload)
# ):

#     user_id = token_data["user_id"]

#     save_user_fcm_token(
#         db,
#         save_fcm_token_data,
#         user_id
#     )

#     return SaveFCMTokenResponse()