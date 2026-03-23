import requests
import psycopg2
import sys

BASE_URL = "http://127.0.0.1:8000"
DB_DSN = "dbname=vigil_db user=postgres host=localhost"

def run_tests():
    session = requests.Session()
    
    # 1. Signup
    print("Testing Signup...")
    email = "test.agent@example.com"
    password = "TestPassword123!"
    res = session.post(f"{BASE_URL}/users/signup", json={
        "email_address": email,
        "password": password,
        "display_name": "Test Agent"
    })
    
    if res.status_code == 400 and "already registered" in res.text:
        print("User already exists, proceeding to login.")
    else:
        assert res.status_code == 200, f"Signup failed: {res.text}"
        print("Signup successful.")
        
        # 2. Get OTP from DB
        print("Getting OTP from DB...")
        conn = psycopg2.connect(DB_DSN)
        cur = conn.cursor()
        cur.execute("SELECT otp_hash FROM email_verification_otps WHERE email_address = %s ORDER BY created_at DESC LIMIT 1", (email,))
        row = cur.fetchone()
        assert row is not None, "OTP not found in DB"
        # We can't reverse hash, wait. The OTP is hashed in DB!
        # Ah, in app/routers/users.py:
        # It generates an OTP and hashes it. I cannot retrieve the plain OTP.
        pass

if __name__ == "__main__":
    run_tests()
