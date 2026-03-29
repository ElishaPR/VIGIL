import asyncio
import io
import requests
from datetime import date

class MockUploadFile:
    def __init__(self, content, filename, content_type):
        self.content = content
        self.filename = filename
        self.content_type = content_type
        
    def read(self):
        return self.content

async def test_frontend_upload_simulation():
    """
    Simulate the exact frontend upload process
    """
    print("Testing Frontend Upload Simulation...")
    
    # Create test file data
    test_content = b"This is a test document uploaded from frontend simulation."
    test_file = MockUploadFile(test_content, "test_frontend_doc.txt", "text/plain")
    
    # Prepare form data exactly like the frontend
    files = {
        'document': (test_file.filename, io.BytesIO(test_file.content), test_file.content_type)
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
            cookies={},  # You'll need to add auth cookies here
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Frontend upload simulation successful!")
            result = response.json()
            print(f"Created reminder UUID: {result.get('reminder_uuid')}")
        else:
            print("❌ Frontend upload simulation failed!")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - possible network or server issue")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - backend server may not be running")
    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_frontend_upload_simulation())
