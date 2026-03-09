import secrets
import hashlib


def generate_otp() -> str:
    """Generate a secure 6-digit OTP."""
    number = secrets.randbelow(900000) + 100000
    return str(number)


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp(otp: str, otp_hash: str) -> bool:
    return hash_otp(otp) == otp_hash