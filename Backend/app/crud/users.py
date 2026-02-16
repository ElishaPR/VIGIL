from typing import Union
from app.models.users import User
from sqlalchemy.orm import Session
from app.schemas.users import SignUpData, LoginData
from app.core.security import pwd_context, password_hashing
  
def create_user(db: Session, user_in: SignUpData)->User:
    final_hashed_password = password_hashing(user_in.raw_password)
    db_user = User(email_address = user_in.email_address, display_name = user_in.display_name, hashed_password = final_hashed_password, is_india_resident = user_in.is_india_resident)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email_address: str)->Union[User, None]:
    email_exists = db.query(User).filter(User.email_address == email_address).first()
    return email_exists


def authenticate_user(db: Session, user_in: LoginData)->Union[User, None]:
    user = get_user_by_email(db, user_in.email_address)
    if not user:
        return None 
    if not pwd_context.verify(user_in.raw_password, user.hashed_password):
        return None
    return user
    