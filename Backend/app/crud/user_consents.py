from sqlalchemy.orm import Session
from app.models.user_consents import User_Consent
from datetime import datetime, timezone

CURRENT_CONSENT_VERSION = "1.0"

def create_user_consent(db: Session, user_id: int, consent_type: str, consent_given: bool) -> User_Consent:
    db_consent = User_Consent(
        user_id=user_id,
        consent_type=consent_type,
        consent_given=consent_given,
        consent_version=CURRENT_CONSENT_VERSION
    )
    db.add(db_consent)
    db.commit()
    db.refresh(db_consent)
    return db_consent

def create_all_signup_consents(db: Session, user_id: int):
    consent_types = [
        ("TERMS_OF_SERVICE", True),
        ("PRIVACY_POLICY", True),
        ("INDIA_RESIDENCY", True)
    ]

    for consent_type, consent_given in consent_types:
        create_user_consent(db, user_id, consent_type, consent_given)
