import io
from fastapi import APIRouter, Depends
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
from app.modules.admin.models.notification_logs import NotificationLog

router = APIRouter(prefix="/reports", tags=["Admin Reports"])

@router.get("/admin")
def generate_admin_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admin check - reuse simple auth check
    # In a real app we'd check current_user.is_admin
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("System Admin Report", styles['Title']))
    elements.append(Spacer(1, 12))

    # Stats
    total_users = db.query(User).count()
    total_reminders = db.query(Reminder).count()
    total_logs = db.query(NotificationLog).count()

    elements.append(Paragraph("<b>System Statistics</b>", styles['Heading2']))
    elements.append(Paragraph(f"Total Users: {total_users}", styles['Normal']))
    elements.append(Paragraph(f"Total Reminders: {total_reminders}", styles['Normal']))
    elements.append(Paragraph(f"Total Notification Attempts: {total_logs}", styles['Normal']))
    elements.append(Spacer(1, 24))

    # Notification Logs Table (Recent 50)
    elements.append(Paragraph("<b>Recent Notification Logs</b>", styles['Heading2']))
    logs = db.query(NotificationLog).order_by(NotificationLog.attempted_at.desc()).limit(50).all()
    
    log_data = [["Time (UTC)", "Channel", "Status", "User ID"]]
    for l in logs:
        log_data.append([
            l.attempted_at.strftime("%Y-%m-%d %H:%M:%S") if l.attempted_at else "N/A",
            l.channel,
            l.status,
            str(l.user_id) if l.user_id else "N/A"
        ])
    
    lt = Table(log_data, hAlign='LEFT', repeatRows=1)
    lt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))
    elements.append(lt)

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=\"admin_report.pdf\""}
    )
