import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.users import User
from app.services.email_service import send_email

VERIFICATION_CODE_EXPIRY_MINUTES = 10
MAX_VERIFICATION_ATTEMPTS = 5

def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def create_verification_code(db: Session, user: User) -> str:
    verification_code = generate_verification_code()
    user.verification_code = verification_code
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES)
    user.verification_attempts = 0
    db.commit()
    return verification_code

def send_verification_email(email_address: str, display_name: str, verification_code: str):
    subject = "Verify Your Vigil Account"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%);
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }}
            .content {{
                background: #ffffff;
                padding: 40px 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
            }}
            .code-box {{
                background: #f3f4f6;
                border: 2px dashed #3B82F6;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 30px 0;
            }}
            .code {{
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #1E3A8A;
                font-family: 'Courier New', monospace;
            }}
            .footer {{
                background: #f9fafb;
                padding: 20px 30px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                border: 1px solid #e5e7eb;
                border-top: none;
                font-size: 14px;
                color: #6b7280;
            }}
            .warning {{
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>VIGIL</h1>
        </div>
        <div class="content">
            <h2 style="color: #1E3A8A; margin-top: 0;">Welcome, {display_name}!</h2>
            <p>Thank you for signing up with Vigil. To complete your registration and start managing your document reminders, please verify your email address.</p>

            <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
                <div class="code">{verification_code}</div>
            </div>

            <p>Enter this code on the verification page to activate your account.</p>

            <div class="warning">
                <strong>Important:</strong> This code will expire in {VERIFICATION_CODE_EXPIRY_MINUTES} minutes. If you didn't create an account with Vigil, please ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from Vigil. Please do not reply to this email.</p>
            <p style="margin: 5px 0;">&copy; 2026 Vigil. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    send_email(email_address, subject, html_content)

def verify_code(db: Session, email_address: str, code: str) -> tuple[bool, str]:
    user = db.query(User).filter(User.email_address == email_address).first()

    if not user:
        return False, "User not found."

    if user.email_verified:
        return False, "Email already verified."

    if user.verification_attempts >= MAX_VERIFICATION_ATTEMPTS:
        return False, "Maximum verification attempts exceeded. Please request a new code."

    if not user.verification_code or not user.verification_expires_at:
        return False, "No verification code found. Please request a new code."

    if datetime.now(timezone.utc) > user.verification_expires_at:
        return False, "Verification code has expired. Please request a new code."

    if user.verification_code != code:
        user.verification_attempts += 1
        db.commit()
        remaining = MAX_VERIFICATION_ATTEMPTS - user.verification_attempts
        return False, f"Invalid verification code. {remaining} attempts remaining."

    user.email_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    user.verification_attempts = 0
    db.commit()

    return True, "Email verified successfully."
