"""
Quick schema audit: verifies all model-declared columns exist in the actual DB.
Run once, then delete.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"), echo=False)

TABLES_TO_CHECK = {
    "users": ["user_id", "user_uuid", "email_address", "hashed_password",
              "display_name", "email_verified", "created_at", "updated_at"],
    "documents": ["doc_id", "user_id", "doc_uuid", "doc_category", "doc_title",
                  "doc_size", "expiry_date", "notes", "mime_type", "storage_key",
                  "created_at", "updated_at"],
    "reminders": ["reminder_id", "user_id", "doc_id", "reminder_uuid",
                  "reminder_title", "schedule_type", "reminder_at", "repeat_type",
                  "priority", "notes", "reminder_status", "email_notification",
                  "push_notification", "created_at", "updated_at"],
}

with engine.connect() as conn:
    all_ok = True
    for table, expected_cols in TABLES_TO_CHECK.items():
        result = conn.execute(text(
            f"SELECT column_name FROM information_schema.columns "
            f"WHERE table_name = '{table}' ORDER BY ordinal_position"
        ))
        actual = [r[0] for r in result.fetchall()]
        missing = [c for c in expected_cols if c not in actual]
        extra   = [c for c in actual if c not in expected_cols]

        status = "OK" if not missing else "MISSING COLUMNS"
        print(f"[{status}] {table}")
        print(f"   actual   : {actual}")
        if missing:
            print(f"   MISSING  : {missing}")
            all_ok = False
        if extra:
            print(f"   extra(ok): {extra}")
        print()

    print("Schema audit PASSED" if all_ok else "Schema audit has ISSUES — run migrations above")
