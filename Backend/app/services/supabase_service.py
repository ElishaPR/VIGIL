from supabase import create_client
from app.core.config import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)


def upload_file(storage_key: str, file_bytes: bytes, mime: str):

    response = supabase.storage.from_(settings.DOCUMENT_BUCKET).upload(
        path=storage_key,
        file=file_bytes,
        file_options={"content-type": mime}
    )

    return response