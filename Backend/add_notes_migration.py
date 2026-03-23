import os
from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE documents ADD COLUMN notes TEXT;"))
            conn.commit()
            print("Migration successful: Added notes column to documents table")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column 'notes' already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
