from app.modules.user.services.supabase_service import get_signed_url, supabase
from app.core.config import settings

print('Testing signed URL generation...')
try:
    url = get_signed_url('test/test.txt')
    print('Signed URL generated:', url[:100] + '...')
except Exception as e:
    print('Error generating signed URL:', type(e).__name__, str(e))

print('\nTesting file list in bucket...')
try:
    files = supabase.storage.from_(settings.DOCUMENT_BUCKET).list()
    print('Files in bucket:', files)
except Exception as e:
    print('Error listing files:', type(e).__name__, str(e))
