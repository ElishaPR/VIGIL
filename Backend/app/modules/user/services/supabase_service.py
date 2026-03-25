from supabase import create_client
from app.core.config import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)


def upload_file(storage_key: str, file_bytes: bytes, mime: str):

    return supabase.storage.from_(settings.DOCUMENT_BUCKET).upload(
        path=storage_key,
        file=file_bytes,
        file_options={"content-type": mime}
    )


def delete_file(storage_key: str):

    return supabase.storage.from_(settings.DOCUMENT_BUCKET).remove(
        [storage_key]
    )


def replace_file(storage_key: str, file_bytes: bytes, mime: str):

    return supabase.storage.from_(settings.DOCUMENT_BUCKET).update(
        path=storage_key,
        file=file_bytes,
        file_options={"content-type": mime}
    )


def get_signed_url(storage_key: str):

    response = supabase.storage.from_(settings.DOCUMENT_BUCKET).create_signed_url(
        storage_key,
        60 * 10
    )

    return response["signedURL"]