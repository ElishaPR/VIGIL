#!/usr/bin/env python3
"""
Fix the reminder-document link
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document
from app.core.config import settings

def fix_reminder_document_link():
    """Fix the reminder-document link"""
    print("FIXING REMINDER-DOCUMENT LINK...")
    
    # Create database session
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Find the reminder
        reminder_uuid = '3829768d-8499-4aca-991e-6a3aee5fef71'
        reminder = db.query(Reminder).filter(Reminder.reminder_uuid == reminder_uuid).first()
        
        if not reminder:
            print("Reminder not found!")
            return
            
        print(f"Found reminder: {reminder.reminder_title}, doc_id: {reminder.doc_id}")
        
        # Find the document
        doc = db.query(Document).filter(Document.doc_title == "Vehicle FC").first()
        
        if not doc:
            print("Document not found!")
            return
            
        print(f"Found document: {doc.doc_title}, doc_id: {doc.doc_id}")
        
        # Update reminder to link to document
        reminder.doc_id = doc.doc_id
        db.commit()
        
        print("✅ SUCCESS: Reminder now linked to document!")
        
        # Verify the fix
        updated_reminder = db.query(Reminder).filter(Reminder.reminder_uuid == reminder_uuid).first()
        print(f"Updated reminder doc_id: {updated_reminder.doc_id}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_reminder_document_link()
