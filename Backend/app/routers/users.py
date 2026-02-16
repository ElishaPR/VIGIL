from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.schemas.users import SignUpData, SignUpUserResponse, LoginData, LoginUserResponse
from app.crud.users import create_user, authenticate_user
from sqlalchemy.exc import IntegrityError
from app.core.security import create_access_token

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup", response_model=SignUpUserResponse, status_code=201)
def signup( signup_data: SignUpData, db: Session = Depends(get_db)):
    try:
        user = create_user(db, signup_data)
        return SignUpUserResponse(user_uuid=str(user.user_uuid), display_name=user.display_name)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email address already exists.")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Signup failed!")
    
@router.post("/login", response_model=LoginUserResponse, status_code=200)
def login(
    username: str = Form(...),
    password: str = Form(...), 
    db: Session = Depends(get_db)):
    login_data = LoginData(email_address=username, raw_password=password)
    try:
        user = authenticate_user(db, login_data)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access_token = create_access_token({"user_id": user.user_id,"user_uuid": str(user.user_uuid), "email": user.email_address, "type": "access"})
        return LoginUserResponse(access_token=access_token, user_uuid=str(user.user_uuid), display_name=user.display_name)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login Failed!")
        