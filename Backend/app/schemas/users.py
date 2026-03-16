from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
import re


NAME_REGEX = r"^[A-Za-z\s\-\.'’]+$"


class SignUpData(BaseModel):

    email_address: EmailStr

    display_name: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    raw_password: str = Field(
        ...,
        min_length=8,
        max_length=64
    )

    india_resident: bool
    document_processing: bool
    terms_of_service: bool

    @field_validator("display_name")
    @classmethod
    def validate_name(cls, v):

        v = v.strip()

        if len(v) > 50:
            raise ValueError(
                "Name is too long. Maximum allowed length is 50 characters."
            )

        if not re.match(NAME_REGEX, v):
            raise ValueError(
                "Name can contain only letters, spaces, hyphens, apostrophes, and periods."
            )

        return v

    @field_validator("raw_password")
    @classmethod
    def validate_password(cls, v):

        if len(v) < 8:
            raise ValueError(
                "Password is too short. Please enter at least 8 characters."
            )

        if len(v) > 64:
            raise ValueError(
                "Password is too long. Maximum allowed length is 64 characters."
            )

        if not any(c.isdigit() for c in v):
            raise ValueError(
                "Password must contain at least one digit."
            )

        return v


class SignUpUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_uuid: str
    display_name: str
    message: str = "Signup successful. Please verify your email."


class LoginData(BaseModel):

    email_address: EmailStr
    raw_password: str = Field(min_length=8, max_length=64)


class LoginUserResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    user_uuid: str
    display_name: str
    message: str = "Login successful."

class UserProfileResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    user_uuid: str
    display_name: str
    email_address: EmailStr


class UpdateProfileData(BaseModel):

    display_name: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    @field_validator("display_name")
    @classmethod
    def validate_name(cls, v):

        v = v.strip()

        if not re.match(NAME_REGEX, v):
            raise ValueError(
                "Name can contain only letters, spaces, hyphens, apostrophes, and periods."
            )

        return v
    
class UpdateProfileResponse(BaseModel):

    message: str = "Profile updated successfully."


class ChangeEmailData(BaseModel):

    new_email_address: EmailStr


class ChangeEmailResponse(BaseModel):

    message: str = "Email updated. Please verify your new email."


class ChangePasswordData(BaseModel):

    current_password: str = Field(min_length=8, max_length=64)
    new_password: str = Field(min_length=8, max_length=64)


class ChangePasswordResponse(BaseModel):

    message: str = "Password updated successfully."