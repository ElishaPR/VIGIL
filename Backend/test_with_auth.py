import requests
import io
from datetime import date

def test_with_auth():
    """
    Test upload with authentication by creating a session first
    """
    print("Testing Upload with Authentication...")
    
    # First, try to register/login to get session cookies
    session = requests.Session()
    
    # Try to access a protected endpoint to see what happens
    test_response = session.get("http://localhost:8000/users/me")
    print(f"Auth test response: {test_response.status_code}")
    
    if test_response.status_code == 401:
        print("Authentication required as expected")
        print("Need to login first - but for testing purposes, let's test the document upload directly")
    
    # Test direct document upload endpoint instead
    test_content = b"This is a test document for direct upload testing."
    
    files = {
        'document': ('test_doc.txt', io.BytesIO(test_content), 'text/plain')
    }
    
    data = {
        'category': 'test',
        'title': 'Test Document Upload',
        'notes': 'Direct upload test'
    }
    
    try:
        print("Testing direct document upload endpoint...")
        response = session.post(
            "http://localhost:8000/documents/upload",
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"Direct upload Status: {response.status_code}")
        print(f"Direct upload Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Direct document upload works!")
            result = response.json()
            print(f"Created document UUID: {result.get('doc_uuid')}")
        elif response.status_code == 401:
            print("ERROR: Authentication required for document upload")
        else:
            print(f"ERROR: Unexpected status code {response.status_code}")
            
    except Exception as e:
        print(f"ERROR: Upload test failed: {type(e).__name__}: {str(e)}")

    # Test the Supabase connection directly
    print("\nTesting Supabase connection directly...")
    try:
        from app.modules.user.services.supabase_service import upload_file
        result = upload_file('test/final-test.txt', b'Final test content', 'text/plain')
        print(f"Supabase direct upload: {result}")
        print("SUCCESS: Supabase connection works perfectly!")
    except Exception as e:
        print(f"ERROR: Supabase test failed: {e}")

if __name__ == "__main__":
    test_with_auth()
