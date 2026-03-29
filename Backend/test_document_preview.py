"""
Test the new document preview endpoint
"""

import requests

def test_document_preview():
    """
    Test the document preview endpoint with a real document UUID
    """
    print("Testing Document Preview Endpoint...")
    
    # First, let's get a list of documents to find a UUID
    try:
        # You'll need to authenticate first, but let's try the endpoint structure
        test_uuid = "5f06bff4-cc89-48b0-91da-d5ef50b53de0"  # From our DOCX test
        
        response = requests.get(
            f"http://localhost:8000/documents/{test_uuid}/preview",
            timeout=30
        )
        
        print(f"Preview Status: {response.status_code}")
        print(f"Preview Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Document preview endpoint works!")
            data = response.json()
            print(f"Document title: {data.get('doc_title')}")
            print(f"File type: {data.get('display_name')}")
            print(f"File icon: {data.get('file_icon')}")
            print(f"Download URL available: {'download_url' in data}")
        elif response.status_code == 401:
            print("Authentication required - this is expected")
        else:
            print(f"Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"Error testing preview: {e}")

if __name__ == "__main__":
    test_document_preview()
