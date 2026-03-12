from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    DOCUMENT_BUCKET: str

    MAX_FILE_SIZE_MB: int = 10

    ENCRYPTION_SECRET: str

    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()