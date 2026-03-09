import requests
import os

BREVO_EMAIL_API_KEY = os.getenv("BREVO_EMAIL_API_KEY")
BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_password_reset_email(to_email: str, display_name: str, otp: str):

    headers = {
        "accept": "application/json",
        "api-key": BREVO_EMAIL_API_KEY,
        "content-type": "application/json"
    }

    html_content = f"""
    <html>
    <body style="font-family:Arial;background:#f4f6f8;padding:40px;">

    <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:8px;">

    <h2>Password Reset</h2>

    <p>Hello {display_name},</p>

    <p>You requested to reset your password for <strong>VIGIL</strong>.</p>

    <div style="
    font-size:32px;
    letter-spacing:5px;
    background:#f1f3f5;
    padding:15px;
    text-align:center;
    border-radius:6px;
    margin:20px 0;">
    {otp}
    </div>

    <p>This code will expire in <strong>10 minutes</strong>.</p>

    <p>If you did not request this, you can ignore this email.</p>

    </div>

    </body>
    </html>
    """

    payload = {
        "sender": {
            "name": "VIGIL",
            "email": "no-reply@vigil.app"
        },
        "to": [{
            "email": to_email,
            "name": display_name
        }],
        "subject": "Reset your password",
        "htmlContent": html_content
    }

    response = requests.post(BREVO_URL, json=payload, headers=headers)

    if response.status_code >= 400:
        raise RuntimeError("Failed to send password reset email.")