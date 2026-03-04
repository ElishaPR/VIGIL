from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Form, Response
from sqlalchemy.orm import Session
from app.schemas.users import SignUpData, SignUpUserResponse, LoginData, LoginUserResponse, SaveFCMTokenData, SaveFCMTokenResponse, VerifyEmailData, VerifyEmailResponse, ResendVerificationData, ResendVerificationResponse
from app.crud.users import create_user, authenticate_user, get_user_by_email
from app.crud.user_consents import create_all_signup_consents
from sqlalchemy.exc import IntegrityError
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_SECONDS, get_current_user_payload
from app.services.user_fcm_token_service import save_user_fcm_token
from app.services.verification_service import create_verification_code, send_verification_email, verify_code

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup", response_model=SignUpUserResponse, status_code=201)
def signup(signup_data: SignUpData, db: Session = Depends(get_db)):
    try:
        user = create_user(db, signup_data)
        create_all_signup_consents(db, user.user_id)
        verification_code = create_verification_code(db, user)
        send_verification_email(user.email_address, user.display_name, verification_code)
        return SignUpUserResponse(
            user_uuid=str(user.user_uuid),
            display_name=user.display_name,
            email_address=user.email_address
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email address already exists.")
    except Exception as e:
        db.rollback()
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed!")
    
@router.post("/login", response_model=LoginUserResponse, status_code=200)
def login(
    login_data: LoginData,
    response: Response,
    db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, login_data)
        if not user:
            user_check = get_user_by_email(db, login_data.email_address)
            if user_check and not user_check.email_verified:
                raise HTTPException(status_code=403, detail="Email not verified. Please verify your email to login.")
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        access_token = create_access_token({"user_id": user.user_id,"user_uuid": str(user.user_uuid), "email": user.email_address, "type": "access"})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_SECONDS
        )
        return LoginUserResponse(access_token="", user_uuid=str(user.user_uuid), display_name=user.display_name)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login Failed!")
    
@router.post("/verify-email", response_model=VerifyEmailResponse, status_code=200)
def verify_email(verify_data: VerifyEmailData, db: Session = Depends(get_db)):
    try:
        success, message = verify_code(db, verify_data.email_address, verify_data.verification_code)
        if not success:
            raise HTTPException(status_code=400, detail=message)
        return VerifyEmailResponse(message=message)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed!")

@router.post("/resend-verification", response_model=ResendVerificationResponse, status_code=200)
def resend_verification(resend_data: ResendVerificationData, db: Session = Depends(get_db)):
    try:
        user = get_user_by_email(db, resend_data.email_address)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        if user.email_verified:
            raise HTTPException(status_code=400, detail="Email already verified.")
        verification_code = create_verification_code(db, user)
        send_verification_email(user.email_address, user.display_name, verification_code)
        return ResendVerificationResponse()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Resend verification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend verification code!")

@router.post("/save-fcm-token", response_model=SaveFCMTokenResponse, status_code=200)
def save_fcm_token(save_fcm_token_data: SaveFCMTokenData, db: Session = Depends(get_db), token_data: dict = Depends(get_current_user_payload)):
    try:
        user_id = token_data["user_id"]
        user_fcm_token = save_user_fcm_token(db, save_fcm_token_data, user_id)
        return SaveFCMTokenResponse()
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to save Push Notification details!")