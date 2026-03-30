import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateAdminReport = (notificationLogs) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Notification Logs Report', 14, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary statistics
  const totalLogs = notificationLogs.length;
  const successLogs = notificationLogs.filter(log => log.status === 'SUCCESS').length;
  const failedLogs = notificationLogs.filter(log => log.status === 'FAILED').length;
  const emailLogs = notificationLogs.filter(log => log.channel === 'EMAIL').length;
  const pushLogs = notificationLogs.filter(log => log.channel === 'PUSH').length;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 45);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Notifications: ${totalLogs}`, 20, 55);
  doc.text(`Successful: ${successLogs}`, 20, 62);
  doc.text(`Failed: ${failedLogs}`, 20, 69);
  doc.text(`Email Notifications: ${emailLogs}`, 20, 76);
  doc.text(`Push Notifications: ${pushLogs}`, 20, 83);
  
  // Success rate
  const successRate = totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(1) : 0;
  doc.text(`Success Rate: ${successRate}%`, 20, 90);
  
  // Table headers
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Logs', 14, 105);
  
  // Table data
  const tableData = notificationLogs.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.recipient_email || 'N/A',
    log.channel,
    log.status,
    log.error_message || 'Success'
  ]);
  
  doc.autoTable({
    head: [['Timestamp', 'Recipient', 'Channel', 'Status', 'Message']],
    body: tableData,
    startY: 115,
    theme: 'grid',
    styles: {
      fontSize: 9,
      font: 'helvetica',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Timestamp
      1: { cellWidth: 45 }, // Recipient
      2: { cellWidth: 25 }, // Channel
      3: { cellWidth: 25 }, // Status
      4: { cellWidth: 55 }  // Message
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
  
  return doc;
};

export const generateUserReport = (reminders) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('My Reminders Report', 14, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary statistics
  const totalReminders = reminders.length;
  const activeReminders = reminders.filter(r => r.status === 'active').length;
  const expiredReminders = reminders.filter(r => r.status === 'expired').length;
  const expiringReminders = reminders.filter(r => r.status === 'expiring').length;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 45);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Reminders: ${totalReminders}`, 20, 55);
  doc.text(`Active: ${activeReminders}`, 20, 62);
  doc.text(`Expired: ${expiredReminders}`, 20, 69);
  doc.text(`Expiring Soon: ${expiringReminders}`, 20, 76);
  
  // Table data
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reminder Details', 14, 90);
  
  const tableData = reminders.map(reminder => [
    reminder.title || 'N/A',
    reminder.category || 'N/A',
    reminder.status || 'N/A',
    reminder.expiry_date ? new Date(reminder.expiry_date).toLocaleDateString() : 'N/A',
    reminder.reminder_at ? new Date(reminder.reminder_at).toLocaleDateString() : 'No specific reminder'
  ]);
  
  doc.autoTable({
    head: [['Title', 'Category', 'Status', 'Expiry Date', 'Reminder Date']],
    body: tableData,
    startY: 100,
    theme: 'grid',
    styles: {
      fontSize: 9,
      font: 'helvetica',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Title
      1: { cellWidth: 25 }, // Category
      2: { cellWidth: 25 }, // Status
      3: { cellWidth: 35 }, // Expiry Date
      4: { cellWidth: 35 }  // Reminder Date
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
  
  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};
