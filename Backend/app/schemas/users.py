from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

class SignUpData(BaseModel):
    email_address: EmailStr
    display_name: str = Field(..., strip_whitespace=True, min_length=1, max_length=50, pattern=r"^[A-Za-z -'.]*$") 
    raw_password: str = Field(..., min_length=8, max_length=64) 
    is_india_resident: bool   

    @field_validator('raw_password')
    @classmethod
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain atleast one digit.')
        return v

class SignUpUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    user_uuid: str
    display_name: str
    message: str = "Signup successful. Please log in to continue."

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