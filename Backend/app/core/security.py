from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM=os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
ACCESS_TOKEN_EXPIRE_SECONDS=ACCESS_TOKEN_EXPIRE_MINUTES * 60
if not JWT_SECRET_KEY:
     raise RuntimeError("JWT_SECRET_KEY is not set.")
if not JWT_ALGORITHM:
     raise RuntimeError("JWT_ALGORITHM is not set.")

def password_hashing(raw_password:str)->str:
     return pwd_context.hash(raw_password)

def create_access_token(data: dict):
     to_encode = data.copy()
     expiry = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
     to_encode.update({"exp": expiry})
     encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
     return encoded_jwt

def get_current_user_payload(request: Request):
     token = request.cookies.get("access_token")

     if not token:
          raise HTTPException(status_code=401, detail="Not authenticated!")
     
     try:
          payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
          return payload
     except JWTError:
          raise HTTPException(status_code=401, detail="Invalid or expired token.")