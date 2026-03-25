import re

NAME_REGEX = r"^[A-Za-z\s\-\.'’]+$"

def validate_name_logic(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("Name cannot be empty.")
    if len(v) > 50:
        raise ValueError("Name is too long. Maximum 50 characters.")
    if not re.match(NAME_REGEX, v):
        raise ValueError("Name contains invalid characters.")
    return v

def validate_password_logic(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters.")
    if len(v) > 64:
        raise ValueError("Password is too long. Maximum 64 characters.")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one digit.")
    return v
