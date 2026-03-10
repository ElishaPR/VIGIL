import requests
import os


BREVO_EMAIL_API_KEY = os.getenv("BREVO_EMAIL_API_KEY")

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_verification_email(to_email: str, display_name: str, otp: str):

    headers = {
        "accept": "application/json",
        "api-key": BREVO_EMAIL_API_KEY,
        "content-type": "application/json"
    }

    html_content = f"""
    <html>
      <body style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:500px;margin:auto;background:white;border-radius:8px;padding:30px;">
        
          <h2 style="color:#2b2f36;">Verify your email</h2>

          <p>Hello {display_name},</p>

          <p>
          Thank you for signing up for <strong>VIGIL</strong>.
          Please use the verification code below to verify your email address.
          </p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:5px;
            background:#f1f3f5;
            padding:15px;
            text-align:center;
            border-radius:6px;
            margin:20px 0;">
            {otp}
          </div>

          <p>This code will expire in <strong>10 minutes</strong>.</p>

          <p>If you did not request this, you can safely ignore this email.</p>

          <hr style="margin-top:30px"/>

          <p style="font-size:12px;color:#888;">
            © VIGIL Security System
          </p>

        </div>
      </body>
    </html>
    """

    payload = {
        "sender": {
            "name": "VIGIL",
            "email": os.getenv("SENDER_EMAIL")
        },
        "to": [
            {
                "email": to_email,
                "name": display_name
            }
        ],
        "subject": "Verify your email address",
        "htmlContent": html_content
    }

    response = requests.post(BREVO_URL, json=payload, headers=headers, timeout=10)

    if response.status_code >= 400:
        raise RuntimeError("Failed to send verification email.")