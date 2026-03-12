from cryptography.fernet import Fernet
import base64
import hashlib

from app.core.config import settings


def _generate_key():
    digest = hashlib.sha256(settings.ENCRYPTION_SECRET.encode()).digest()
    return base64.urlsafe_b64encode(digest)


fernet = Fernet(_generate_key())


def encrypt_file(data: bytes) -> bytes:
    return fernet.encrypt(data)


def decrypt_file(data: bytes) -> bytes:
    return fernet.decrypt(data)