import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException


def send_email(
    to_email: str,
    subject: str,
    reminder_title: str,
    reminder_uuid: str
):

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = os.getenv("BREVO_EMAIL_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    link = f"https://vigil-placeholder.app/reminder/{reminder_uuid}"

    html_content = f"""
    <div style="font-family: Arial; padding:20px">
        <img src="https://vigil-placeholder.app/logo.png" width="120"/>

        <h2>Document Reminder</h2>

        <p>Your reminder <b>{reminder_title}</b> is due.</p>

        <p>
            <a href="{link}"
               style="
               background:#2563eb;
               color:white;
               padding:10px 16px;
               text-decoration:none;
               border-radius:6px;">
               View Reminder
            </a>
        </p>

        <br>

        <small>
        Sent by Vigil Document Reminder
        </small>
    </div>
    """

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        sender={
            "email": os.getenv("SENDER_EMAIL"),
            "name": "Vigil"
        },
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(email)
        print("Email sent to", to_email)

    except ApiException as e:
        print("Email failed:", e)
        raise