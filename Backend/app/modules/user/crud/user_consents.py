from sqlalchemy.orm import Session
from app.modules.user.models.user_consents import User_Consent

CONSENT_VERSION = "1.0"

def create_user_consents(db: Session, user_id: int):
    consents = [
        User_Consent(
            user_id=user_id,
            consent_type="INDIA_RESIDENCY_DECLARATION",
            consent_given=True,
            consent_version=CONSENT_VERSION
        ),
        User_Consent(
            user_id=user_id,
            consent_type="DOCUMENT_PROCESSING",
            consent_given=True,
            consent_version=CONSENT_VERSION
        ),
        User_Consent(
            user_id=user_id,
            consent_type="TERMS_OF_SERVICE",
            consent_given=True,
            consent_version=CONSENT_VERSION
        ),
    ]
    db.add_all(consents)