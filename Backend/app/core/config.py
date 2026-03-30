from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    DOCUMENT_BUCKET: str
    MAX_FILE_SIZE_MB: int = 10
    ENCRYPTION_SECRET: str
    DATABASE_URL: str
    ADMIN_EMAIL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()