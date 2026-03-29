import asyncio
import io
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.modules.user.services.document_service import create_document_service
from app.core.database import get_db
from app.modules.user.models.users import User
from datetime import date

class MockUploadFile:
    def __init__(self, content, filename, content_type):
        self.content = content
        self.filename = filename
        self.content_type = content_type
        
    async def read(self):
        return self.content

async def test_direct_upload():
    """
    Test the document upload directly without going through the API layer
    """
    print("Testing Direct Document Upload...")
    
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Find a test user
        test_user = db.query(User).first()
        if not test_user:
            print("No users found in database")
            return
            
        print(f"Found user: {test_user.email_address}")
        
        # Create test file
        test_content = b"This is a test document for direct upload testing."
        test_file = MockUploadFile(test_content, "direct_test_doc.txt", "text/plain")
        
        print("Starting document upload...")
        
        # Test document creation
        doc = await create_document_service(
            db=db,
            user_id=test_user.user_id,
            user_uuid=str(test_user.user_uuid),
            category="test",
            title="Direct Test Document",
            expiry_date=date.today(),
            notes="Direct upload test",
            file=test_file
        )
        
        print(f"Document created successfully!")
        print(f"   Document UUID: {doc.doc_uuid}")
        print(f"   Storage key: {doc.storage_key}")
        print(f"   Document size: {doc.doc_size} bytes")
        print(f"   MIME type: {doc.mime_type}")
        
        # Test retrieval
        from app.modules.user.services.supabase_service import get_signed_url
        try:
            url = get_signed_url(doc.storage_key)
            print(f"Signed URL generated: {url[:80]}...")
        except Exception as e:
            print(f"Failed to generate signed URL: {e}")
        
        print("Direct upload test completed successfully!")
        
    except Exception as e:
        print(f"Direct upload test failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_direct_upload())
