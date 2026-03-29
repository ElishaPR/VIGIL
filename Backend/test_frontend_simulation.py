import requests
import io
from datetime import date

def test_frontend_upload_simulation():
    """
    Test the exact frontend upload process with proper authentication
    """
    print("Testing Frontend Upload Simulation...")
    
    # Create test file data
    test_content = b"This is a test document uploaded from frontend simulation."
    
    # Prepare form data exactly like the frontend
    files = {
        'document': ('test_frontend_doc.txt', io.BytesIO(test_content), 'text/plain')
    }
    
    data = {
        'timezone': 'UTC',
        'category': 'test',
        'title': 'Frontend Test Document',
        'repeat_type': 'none',
        'priority': 'medium',
        'expiry_date': '2026-12-31',
        'schedule_type': 'DEFAULT',
        'enable_push': 'false',
        'notes': 'Test upload from frontend simulation'
    }
    
    try:
        print("Sending request to backend...")
        response = requests.post(
            "http://localhost:8000/reminders/create",
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Frontend upload simulation successful!")
            result = response.json()
            print(f"Created reminder UUID: {result.get('reminder_uuid')}")
        elif response.status_code == 401:
            print("ERROR: Authentication required - this is expected without proper cookies")
        elif response.status_code == 422:
            print("ERROR: Validation error")
            try:
                error_detail = response.json()
                print(f"Validation details: {error_detail}")
            except:
                print("Could not parse validation error")
        else:
            print(f"ERROR: Unexpected status code {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out - possible network or server issue")
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection error - backend server may not be running")
    except Exception as e:
        print(f"ERROR: Unexpected error: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    test_frontend_upload_simulation()
