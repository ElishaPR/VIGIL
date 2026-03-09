from pydantic import BaseModel, Field


class VerifyEmailOTPData(BaseModel):

    otp: str = Field(min_length=6, max_length=6)


class VerifyEmailOTPResponse(BaseModel):

    message: str = "Email verified successfully."


class ResendOTPResponse(BaseModel):

    message: str = "Verification code sent."