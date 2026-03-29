import requests

def test_reminder_response():
    """
    Test the reminder endpoint response structure
    """
    print("Testing Reminder Response Structure...")
    
    # Test with a sample reminder UUID (you'll need to replace with actual)
    test_uuid = 'test-uuid'
    try:
        response = requests.get(f'http://localhost:8000/reminders/{test_uuid}', timeout=5)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print('Response structure:')
            for key, value in data.items():
                print(f'  {key}: {type(value).__name__} = {value}')
        elif response.status_code == 401:
            print('Authentication required')
        elif response.status_code == 404:
            print('Reminder not found')
        else:
            print(f'Unexpected status: {response.status_code}')
            print(f'Response: {response.text}')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    test_reminder_response()
