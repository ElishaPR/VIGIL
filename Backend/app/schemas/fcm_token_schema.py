from pydantic import BaseModel, Field


class SaveFCMTokenRequest(BaseModel):

    fcm_token: str = Field(..., min_length=10)


class FCMTokenResponse(BaseModel):

    message: str