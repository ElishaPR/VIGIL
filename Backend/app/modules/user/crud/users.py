from sqlalchemy.exc import IntegrityError
from typing import Union
from sqlalchemy.orm import Session

from app.modules.user.models.users import User
from app.modules.user.schemas.users import SignUpData, LoginData
from app.core.security import password_hashing, verify_password


def create_user(db: Session, user_in: SignUpData) -> User:

    final_hashed_password = password_hashing(user_in.raw_password)

    db_user = User(
        email_address=user_in.email_address,
        display_name=user_in.display_name,
        hashed_password=final_hashed_password,
    )

    db.add(db_user)
    db.flush()

    return db_user


def get_user_by_email(db: Session, email_address: str) -> Union[User, None]:

    return (
        db.query(User)
        .filter(User.email_address == email_address)
        .first()
    )


def authenticate_user(db: Session, user_in: LoginData) -> Union[User, None]:

    user = get_user_by_email(db, user_in.email_address)

    if not user:
        return None

    if not verify_password(user_in.raw_password, user.hashed_password):
        return None

    return user



def update_display_name(db: Session, user: User, display_name: str):

    user.display_name = display_name
    db.commit()
    db.refresh(user)

    return user


def change_user_email(db: Session, user: User, new_email: str):

    user.email_address = new_email
    user.email_verified = False

    db.commit()
    db.refresh(user)

    return user


def change_user_password(db: Session, user: User, new_password: str):

    user.hashed_password = password_hashing(new_password)

    db.commit()
    db.refresh(user)

    return user