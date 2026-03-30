"""
Migration: Add user_id column to reminders table.
This script is safe to run multiple times - it checks before altering.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("ERROR: DATABASE_URL not set in .env")

engine = create_engine(DATABASE_URL, echo=False)

with engine.begin() as conn:

    # ── 1. Check current columns on reminders ─────────────────────────────
    result = conn.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reminders'
        ORDER BY ordinal_position
    """))
    existing_cols = [r[0] for r in result.fetchall()]
    print(f"Current reminders columns: {existing_cols}")

    # ── 2. Add user_id if absent ──────────────────────────────────────────
    if "user_id" not in existing_cols:
        print("→ Adding user_id column (nullable) ...")
        conn.execute(text("ALTER TABLE reminders ADD COLUMN user_id INTEGER"))

        # Populate existing rows with the first user found (dev / single-user safety)
        result = conn.execute(text("SELECT MIN(user_id) FROM users"))
        default_uid = result.fetchone()[0]
        if default_uid is None:
            raise SystemExit("ERROR: No users in the database. Create a user first.")

        print(f"→ Backfilling existing reminders with user_id = {default_uid} ...")
        conn.execute(text(f"UPDATE reminders SET user_id = {default_uid} WHERE user_id IS NULL"))

        print("→ Setting NOT NULL constraint ...")
        conn.execute(text("ALTER TABLE reminders ALTER COLUMN user_id SET NOT NULL"))

        print("→ Adding foreign key to users.user_id ...")
        conn.execute(text("""
            ALTER TABLE reminders
            ADD CONSTRAINT reminders_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        """))

        print("✅  user_id column added and FK created successfully.")
    else:
        print("✅  user_id column already exists — nothing to do.")

    # ── 3. Verify final schema ────────────────────────────────────────────
    result = conn.execute(text("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reminders'
        ORDER BY ordinal_position
    """))
    print("\nFinal reminders schema:")
    for row in result.fetchall():
        print(f"  {row[0]:30s}  {row[1]:20s}  nullable={row[2]}")

print("\nMigration complete.")
