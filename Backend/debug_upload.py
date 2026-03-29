import asyncio
import uuid
from datetime import date
from app.modules.user.services.document_service import create_document_service
from app.core.database import get_db
from app.modules.user.models.users import User

async def test_document_upload():
    # Simulate a file upload
    class MockFile:
        def __init__(self):
            self.filename = "test_document.txt"
            self.content_type = "text/plain"
            
        async def read(self):
            return b"This is a test document for debugging upload issues."
    
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Find a test user (you may need to adjust this)
        test_user = db.query(User).first()
        if not test_user:
            print("No users found in database")
            return
            
        print(f"Testing upload for user: {test_user.email_address}")
        
        # Test document creation
        mock_file = MockFile()
        
        doc = await create_document_service(
            db=db,
            user_id=test_user.user_id,
            user_uuid=str(test_user.user_uuid),
            category="test",
            title="Test Document Upload",
            expiry_date=date.today(),
            notes="Test upload for debugging",
            file=mock_file
        )
        
        print(f"Document created successfully!")
        print(f"Document UUID: {doc.doc_uuid}")
        print(f"Storage key: {doc.storage_key}")
        print(f"Document size: {doc.doc_size} bytes")
        
        # Test if we can retrieve it
        from app.modules.user.services.supabase_service import get_signed_url
        url = get_signed_url(doc.storage_key)
        print(f"Signed URL: {url[:100]}...")
        
    except Exception as e:
        print(f"Error during upload test: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_document_upload())
