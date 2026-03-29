import requests
import json

def create_test_user():
    """
    Create a test user for authentication testing
    """
    print("Creating test user for authentication...")
    
    user_data = {
        "email_address": "testuser@vigil.com",
        "raw_password": "TestPassword123!",
        "display_name": "Test User",
        "india_resident": True,
        "document_processing": True,
        "terms_of_service": True
    }
    
    try:
        # Try to create user
        response = requests.post(
            "http://localhost:8000/users/signup",
            json=user_data,
            timeout=30
        )
        
        print(f"Registration Status: {response.status_code}")
        print(f"Registration Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Test user created!")
            return True
        elif response.status_code == 400:
            print("User might already exist, trying to login...")
            return login_test_user()
        else:
            print(f"ERROR: Registration failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"ERROR: Registration failed: {type(e).__name__}: {str(e)}")
        return False

def login_test_user():
    """
    Login the test user to get session cookies
    """
    print("Attempting to login test user...")
    
    login_data = {
        "email_address": "testuser@vigil.com",
        "raw_password": "TestPassword123!"
    }
    
    session = requests.Session()
    
    try:
        response = session.post(
            "http://localhost:8000/users/login",
            json=login_data,
            timeout=30
        )
        
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Test user logged in!")
            print("Session cookies:", session.cookies.get_dict())
            return session
        else:
            print(f"ERROR: Login failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"ERROR: Login failed: {type(e).__name__}: {str(e)}")
        return None

if __name__ == "__main__":
    create_test_user()
