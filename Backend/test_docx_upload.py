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

async def test_docx_upload():
    """
    Test DOCX file upload to see MIME type handling
    """
    print("Testing DOCX File Upload...")
    
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
        
        # Create test DOCX file content (simplified)
        test_content = b"PK\x03\x04\x14\x00\x06\x00"  # DOCX magic bytes
        test_file = MockUploadFile(
            test_content, 
            "test_document.docx", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        
        print("Starting DOCX upload...")
        print(f"File name: {test_file.filename}")
        print(f"Content type: {test_file.content_type}")
        
        # Test document creation
        doc = await create_document_service(
            db=db,
            user_id=test_user.user_id,
            user_uuid=str(test_user.user_uuid),
            category="test",
            title="Test DOCX Document",
            expiry_date=date.today(),
            notes="Testing DOCX upload",
            file=test_file
        )
        
        print(f"Document created successfully!")
        print(f"   Document UUID: {doc.doc_uuid}")
        print(f"   Storage key: {doc.storage_key}")
        print(f"   Document size: {doc.doc_size} bytes")
        print(f"   MIME type in DB: {doc.mime_type}")
        
        # Test retrieval
        from app.modules.user.services.supabase_service import get_signed_url, download_file
        try:
            url = get_signed_url(doc.storage_key)
            print(f"Signed URL generated: {url[:80]}...")
            
            # Test download to see what Supabase returns
            downloaded_content = download_file(doc.storage_key)
            print(f"Downloaded content size: {len(downloaded_content)} bytes")
            print(f"Downloaded content starts with: {downloaded_content[:20]}")
            
        except Exception as e:
            print(f"Failed to download: {e}")
        
        print("DOCX upload test completed!")
        
    except Exception as e:
        print(f"DOCX upload test failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_docx_upload())
