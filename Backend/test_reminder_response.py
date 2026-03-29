import requests
import json

def test_reminder_response():
    """
    Test the actual reminder endpoint with real UUID
    """
    print("Testing Reminder Response Structure...")
    
    # Use the real UUID from database
    test_uuid = '3829768d-8499-4aca-991e-6a3aee5fef71'
    
    try:
        # First test without auth to see structure
        response = requests.get(f'http://localhost:8000/reminders/{test_uuid}', timeout=5)
        print(f'Status: {response.status_code}')
        
        if response.status_code == 401:
            print("Authentication required - trying to simulate with session...")
            
            # Try with session cookies if available
            session = requests.Session()
            session.cookies.set('session', 'test')  # This won't work but worth trying
            
            response = session.get(f'http://localhost:8000/reminders/{test_uuid}', timeout=5)
            print(f'Session test Status: {response.status_code}')
            
        elif response.status_code == 200:
            data = response.json()
            print('✅ SUCCESS - Response structure:')
            print(json.dumps(data, indent=2))
            
            # Check specifically for document fields
            print('\n📋 DOCUMENT FIELDS CHECK:')
            print(f'document_url: {data.get("document_url", "MISSING")}')
            print(f'document_name: {data.get("document_name", "MISSING")}')
            print(f'category: {data.get("category", "MISSING")}')
            
        elif response.status_code == 404:
            print('❌ Reminder not found')
        else:
            print(f'❌ Unexpected status: {response.status_code}')
            print(f'Response: {response.text}')
            
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == "__main__":
    test_reminder_response()
