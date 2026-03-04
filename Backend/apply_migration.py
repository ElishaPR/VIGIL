import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set.")

engine = create_engine(DATABASE_URL, echo=True)

migration_file = "migrations/001_add_email_verification_and_consents.sql"

with open(migration_file, "r") as f:
    migration_sql = f.read()

with engine.connect() as conn:
    conn.execute(text(migration_sql))
    conn.commit()
    print(f"✅ Migration {migration_file} applied successfully!")
