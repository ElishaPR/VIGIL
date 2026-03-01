import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

def send_email(to_email: str, subject: str, html_content: str):

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = os.getenv("BREVO_EMAIL_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

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
        print(f"Email sent to {to_email}")
    except ApiException as e:
        print("Email failed:", e)