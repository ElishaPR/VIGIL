#!/usr/bin/env python3
"""
Debug the reminder endpoint database query
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document
from app.core.config import settings

def debug_reminder_query():
    """Debug the reminder database query"""
    print("DEBUGGING REMINDER QUERY...")
    
    # Create database session
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Use the real UUID
        reminder_uuid = '3829768d-8499-4aca-991e-6a3aee5fef71'
        
        print(f"Looking for reminder with UUID: {reminder_uuid}")
        
        # Query reminder
        reminder = db.query(Reminder).filter(Reminder.reminder_uuid == reminder_uuid).first()
        
        if not reminder:
            print("Reminder not found!")
            return
            
        print(f"Found reminder:")
        print(f"  reminder_id: {reminder.reminder_id}")
        print(f"  doc_id: {reminder.doc_id}")
        print(f"  reminder_title: {reminder.reminder_title}")
        
        # Query document if doc_id exists
        if reminder.doc_id:
            print(f"\nLooking for document with doc_id: {reminder.doc_id}")
            doc = db.query(Document).filter(Document.doc_id == reminder.doc_id).first()
            
            if not doc:
                print("Document not found!")
                return
                
            print(f"Found document:")
            print(f"  doc_uuid: {doc.doc_uuid}")
            print(f"  doc_title: {doc.doc_title}")
            print(f"  doc_category: {doc.doc_category}")
            print(f"  storage_key: {doc.storage_key}")
            print(f"  doc_size: {doc.doc_size}")
            
            # Test the URL generation
            document_url = f"http://localhost:8000/documents/{doc.doc_uuid}" if doc and doc.doc_size > 0 else None
            document_name = doc.doc_title if doc and doc.doc_size > 0 else None
            
            print(f"\nGenerated fields:")
            print(f"  document_url: {document_url}")
            print(f"  document_name: {document_name}")
            
        else:
            print("No doc_id - no document linked")
            # But let's check if there's a document that should be linked
            print("\nLet's check for documents that might belong to this reminder...")
            docs = db.query(Document).filter(Document.doc_title == "Vehicle FC").all()
            for doc in docs:
                print(f"  Document found:")
                print(f"    doc_id: {doc.doc_id}")
                print(f"    doc_uuid: {doc.doc_uuid}")
                print(f"    doc_title: {doc.doc_title}")
                print(f"    user_id: {doc.user_id}")
                print(f"    created_at: {doc.created_at}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_reminder_query()
