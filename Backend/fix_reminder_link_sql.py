#!/usr/bin/env python3
"""
Fix the reminder-document link with direct SQL
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def fix_reminder_document_link():
    """Fix the reminder-document link with direct SQL"""
    print("FIXING REMINDER-DOCUMENT LINK...")
    
    # Create database session
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Use direct SQL to update the reminder
        reminder_uuid = '3829768d-8499-4aca-991e-6a3aee5fef71'
        doc_id = 1
        
        print(f"Updating reminder {reminder_uuid} to link with document {doc_id}")
        
        # Direct SQL update
        sql = text("""
            UPDATE reminders 
            SET doc_id = :doc_id 
            WHERE reminder_uuid = :reminder_uuid
        """)
        
        result = db.execute(sql, {"doc_id": doc_id, "reminder_uuid": reminder_uuid})
        db.commit()
        
        print(f"SUCCESS: Updated {result.rowcount} rows")
        
        # Verify the fix
        verify_sql = text("""
            SELECT r.reminder_title, r.doc_id, d.doc_title, d.doc_uuid
            FROM reminders r
            LEFT JOIN documents d ON r.doc_id = d.doc_id
            WHERE r.reminder_uuid = :reminder_uuid
        """)
        
        verification = db.execute(verify_sql, {"reminder_uuid": reminder_uuid}).fetchone()
        print(f"Verification result: {verification}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_reminder_document_link()
