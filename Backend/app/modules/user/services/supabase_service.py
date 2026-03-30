from supabase import create_client
from app.core.config import settings
import logging

# Set up logging
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
        # SDK v2 returns a dict {'signedURL': '...'}, SDK v1 returns object with .signed_url
        if isinstance(response, dict):
            url = response.get("signedURL") or response.get("signed_url") or response.get("url")
            if not url:
                raise ValueError(f"No signed URL in Supabase response: {response}")
            return url
        return response.signed_url
        
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