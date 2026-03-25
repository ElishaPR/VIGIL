from pydantic import BaseModel, EmailStr, Field, field_validator
from app.core.validation import validate_password_logic


class ForgotPasswordData(BaseModel):
    email_address: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str = "If the email exists, a reset code has been sent."


class VerifyResetOTPData(BaseModel):
    email_address: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class VerifyResetOTPResponse(BaseModel):
    message: str = "OTP verified."


class ResetPasswordData(BaseModel):
    email_address: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=64)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return validate_password_logic(v)


class ResetPasswordResponse(BaseModel):
    message: str = "Password reset successful."