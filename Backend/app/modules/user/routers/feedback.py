from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User
from app.core.config import settings
from pydantic import BaseModel, Field
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class FeedbackRequest(BaseModel):
    subject: str = Field(..., min_length=3, max_length=100)
    message: str = Field(..., min_length=10, max_length=1000)

@router.post("/submit")
def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user)
):
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = os.getenv("BREVO_EMAIL_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    html_content = f"""
    <div style="font-family: Arial; padding:20px">
        <h2>New User Feedback</h2>
        <p><b>From:</b> {current_user.display_name} ({current_user.email_address})</p>
        <p><b>Subject:</b> {data.subject}</p>
        <p><b>Message:</b></p>
        <div style="background:#f4f4f4; padding:15px; border-radius:5px;">
            {data.message.replace(chr(10), '<br>')}
        </div>
        <br>
        <p><a href="https://mail.zoho.in" style="background:#2563eb; color:white; padding:10px 16px; text-decoration:none; border-radius:6px;">Open Zoho Mail</a></p>
    </div>
    """

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": settings.ADMIN_EMAIL}],
        sender={
            "email": os.getenv("SENDER_EMAIL"),
            "name": "Vigil Feedback System"
        },
        reply_to={
            "email": current_user.email_address,
            "name": current_user.display_name
        },
        subject=f"[Feedback] {data.subject}",
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(email)
    except ApiException as e:
        print("Feedback email failed:", e)
        raise HTTPException(status_code=500, detail="Failed to send feedback email.")

    return {"message": "Feedback submitted successfully."}
