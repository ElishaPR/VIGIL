from supabase import create_client
from app.core.config import settings
import logging
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)


def upload_file(storage_key: str, file_bytes: bytes, mime: str):
    """
    Enhanced upload function with better error handling and logging
    """
    try:
        logger.info(f"Starting upload to Supabase: {storage_key}")
        logger.info(f"File size: {len(file_bytes)} bytes")
        logger.info(f"Content type: {mime}")
        
        result = supabase.storage.from_(settings.DOCUMENT_BUCKET).upload(
            path=storage_key,
            file=file_bytes,
            file_options={"content-type": mime}
        )
        
        logger.info(f"Upload successful: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Upload failed for {storage_key}: {type(e).__name__}: {str(e)}")
        # Check if it's a Supabase specific error
        if hasattr(e, 'message'):
            logger.error(f"Supabase error message: {e.message}")
        if hasattr(e, 'json'):
            logger.error(f"Supabase error details: {e.json()}")
        raise


def delete_file(storage_key: str):
    """
    Enhanced delete function with better error handling and logging
    """
    try:
        logger.info(f"Deleting file from Supabase: {storage_key}")
        
        result = supabase.storage.from_(settings.DOCUMENT_BUCKET).remove(
            [storage_key]
        )
        
        logger.info(f"Delete successful: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Delete failed for {storage_key}: {type(e).__name__}: {str(e)}")
        raise


def replace_file(storage_key: str, file_bytes: bytes, mime: str):
    """
    Enhanced replace function with better error handling and logging
    """
    try:
        logger.info(f"Replacing file in Supabase: {storage_key}")
        logger.info(f"New file size: {len(file_bytes)} bytes")
        
        result = supabase.storage.from_(settings.DOCUMENT_BUCKET).update(
            path=storage_key,
            file=file_bytes,
            file_options={"content-type": mime}
        )
        
        logger.info(f"Replace successful: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Replace failed for {storage_key}: {type(e).__name__}: {str(e)}")
        raise


def get_signed_url(storage_key: str):
    """
    Enhanced signed URL function with better error handling and logging
    """
    try:
        logger.info(f"Generating signed URL for: {storage_key}")
        
        response = supabase.storage.from_(settings.DOCUMENT_BUCKET).create_signed_url(
            storage_key,
            60 * 10  # 10 minutes
        )
        
        logger.info(f"Signed URL generated successfully")
        return response["signedURL"]
        
    except Exception as e:
        logger.error(f"Signed URL generation failed for {storage_key}: {type(e).__name__}: {str(e)}")
        raise


def download_file(storage_key: str) -> bytes:
    """
    Enhanced download function with better error handling and logging
    """
    try:
        logger.info(f"Downloading file from Supabase: {storage_key}")
        
        response = supabase.storage.from_(settings.DOCUMENT_BUCKET).download(storage_key)
        
        logger.info(f"Download successful, size: {len(response)} bytes")
        return response
        
    except Exception as e:
        logger.error(f"Download failed for {storage_key}: {type(e).__name__}: {str(e)}")
        raise


def test_supabase_connection():
    """
    Test function to verify Supabase connectivity and permissions
    """
    try:
        logger.info("Testing Supabase connection...")
        
        # Test bucket access
        buckets = supabase.storage.list_buckets()
        bucket_names = [bucket.name for bucket in buckets]
        logger.info(f"Available buckets: {bucket_names}")
        
        if settings.DOCUMENT_BUCKET not in bucket_names:
            logger.error(f"Target bucket '{settings.DOCUMENT_BUCKET}' not found!")
            return False
        
        # Test upload
        test_key = f"test/connection-test-{uuid.uuid4()}.txt"
        test_data = b"Connection test"
        upload_result = upload_file(test_key, test_data, "text/plain")
        logger.info(f"Test upload successful: {upload_result}")
        
        # Test download
        downloaded_data = download_file(test_key)
        if downloaded_data == test_data:
            logger.info("Test download successful - data matches")
        else:
            logger.error("Test download failed - data mismatch")
            return False
        
        # Test signed URL
        signed_url = get_signed_url(test_key)
        logger.info(f"Test signed URL generated: {signed_url[:100]}...")
        
        # Cleanup
        delete_file(test_key)
        logger.info("Test file deleted")
        
        logger.info("All Supabase tests passed!")
        return True
        
    except Exception as e:
        logger.error(f"Supabase connection test failed: {type(e).__name__}: {str(e)}")
        return False
