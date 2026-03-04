from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

class SignUpData(BaseModel):
    email_address: EmailStr
    display_name: str = Field(..., strip_whitespace=True, min_length=1, max_length=50, pattern=r"^[A-Za-z -'.]*$")
    raw_password: str = Field(..., min_length=8, max_length=64)
    is_india_resident: bool
    terms_accepted: bool
    privacy_accepted: bool

    @field_validator('raw_password')
    @classmethod
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain atleast one digit.')
        return v

    @field_validator('is_india_resident', 'terms_accepted', 'privacy_accepted')
    @classmethod
    def validate_consents(cls, v, info):
        if not v:
            field_name = info.field_name.replace('_', ' ').title()
            raise ValueError(f'{field_name} must be accepted.')
        return v

class SignUpUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_uuid: str
    display_name: str
    email_address: str
    message: str = "Verification code sent to your email. Please verify to continue."

class LoginData(BaseModel):
    email_address: EmailStr
    raw_password: str = Field(..., min_length=8, max_length=64)

class LoginUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True) 

    access_token: str
    token_type: str = "Bearer"
    user_uuid: str
    display_name: str
    message: str = "Login successful."

class SaveFCMTokenData(BaseModel):
    fcm_token: str  

class SaveFCMTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str = "Push Notification details saved successfully."

class VerifyEmailData(BaseModel):
    email_address: EmailStr
    verification_code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")

class VerifyEmailResponse(BaseModel):
    message: str = "Email verified successfully. You can now log in."

class ResendVerificationData(BaseModel):
    email_address: EmailStr

class ResendVerificationResponse(BaseModel):
    message: str = "Verification code resent to your email."