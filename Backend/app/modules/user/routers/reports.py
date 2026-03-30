import io
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from app.core.database import get_db
from app.core.dependencies.auth_cookie import get_current_user
from app.modules.user.models.users import User
from app.modules.user.models.reminders import Reminder
from app.modules.user.models.documents import Document

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/user")
def generate_user_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph(f"User Report: {current_user.display_name}", styles['Title']))
    elements.append(Spacer(1, 12))

    # User Info
    elements.append(Paragraph(f"<b>Email:</b> {current_user.email_address}", styles['Normal']))
    elements.append(Spacer(1, 12))

    # Reminders Table
    elements.append(Paragraph("<b>Reminders</b>", styles['Heading2']))
    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.user_id).all()
    reminder_data = [["Title", "Date (UTC)", "Priority"]]
    for r in reminders:
        reminder_data.append([
            r.reminder_title, 
            r.reminder_at.strftime("%Y-%m-%d %H:%M") if r.reminder_at else "N/A", 
            r.priority
        ])
    
    rt = Table(reminder_data, hAlign='LEFT')
    rt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    elements.append(rt)
    elements.append(Spacer(1, 24))

    # Documents Table
    elements.append(Paragraph("<b>Documents</b>", styles['Heading2']))
    documents = db.query(Document).filter(Document.user_id == current_user.user_id).all()
    documents = [d for d in documents if not d.storage_key.startswith("virtual/")]
    document_data = [["Title", "Category", "Size (KB)"]]
    for d in documents:
        document_data.append([
            d.doc_title,
            d.doc_category,
            f"{d.doc_size / 1024:.2f}"
        ])
    
    dt = Table(document_data, hAlign='LEFT')
    dt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    elements.append(dt)

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=\"user_report.pdf\""}
    )
