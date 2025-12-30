/**
 * Report Service
 * 
 * This module handles generation of attendance reports in various formats.
 * Currently supports CSV and PDF formats.
 * 
 * Why separate report service:
 * - Encapsulates report generation logic
 * - Easy to add new report formats later
 * - Reusable across different endpoints
 * - Separates report logic from HTTP handling
 */

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const sessionService = require('./session.service');
const attendanceService = require('./attendance.service');
const config = require('../config/config');
const fileUtil = require('../utils/file.util');

/**
 * Generates a CSV report for a session
 * 
 * CSV format is simple and works with Excel and other spreadsheet software.
 * This makes it easy for teachers to analyze attendance data.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<string>} Path to the generated CSV file
 */
async function generateCSVReport(sessionId) {
  // Get session details
  const session = await sessionService.getSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Get attendance records
  const attendance = await attendanceService.getAttendanceBySession(sessionId);
  
  // Ensure reports directory exists
  await fileUtil.ensureDirectoryExists(config.reports.csvDirectory);
  
  // Generate filename with date for easy identification
  const dateString = new Date(session.startTime).toISOString().split('T')[0];
  const filename = `attendance_${sessionId}_${dateString}.csv`;
  const filePath = path.join(config.reports.csvDirectory, filename);
  
  // Create CSV writer with column definitions
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'rollNo', title: 'Roll Number' },
      { id: 'timestamp', title: 'Timestamp' },
      { id: 'status', title: 'Status' }
    ]
  });
  
  // Prepare data rows
  // CSV writer expects array of objects with matching field names
  const records = attendance.map(record => ({
    rollNo: record.rollNo,
    timestamp: record.timestamp,
    status: record.status
  }));
  
  // Write CSV file
  await csvWriter.writeRecords(records);
  
  return filePath;
}

/**
 * Generates a PDF report for a session
 * 
 * PDF format is professional and suitable for printing or archiving.
 * Includes session details and formatted attendance list.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<string>} Path to the generated PDF file
 */
async function generatePDFReport(sessionId) {
  // Get session details
  const session = await sessionService.getSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Get attendance records
  const attendance = await attendanceService.getAttendanceBySession(sessionId);
  
  // Ensure reports directory exists
  await fileUtil.ensureDirectoryExists(config.reports.pdfDirectory);
  
  // Generate filename with date
  const dateString = new Date(session.startTime).toISOString().split('T')[0];
  const filename = `attendance_${sessionId}_${dateString}.pdf`;
  const filePath = path.join(config.reports.pdfDirectory, filename);
  
  // Create PDF document
  const doc = new PDFDocument({
    margin: 50, // Margin in points (1/72 inch)
    size: 'A4' // Standard paper size
  });
  
  // Pipe PDF to file
  const writeStream = require('fs').createWriteStream(filePath);
  doc.pipe(writeStream);
  
  // Add header section
  doc.fontSize(20).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  
  // Add session information
  doc.fontSize(12);
  doc.text(`Class: ${session.class}`);
  doc.text(`Subject: ${session.subject}`);
  doc.text(`Section: ${session.section}`);
  doc.text(`Date: ${new Date(session.startTime).toLocaleDateString()}`);
  doc.text(`Total Attendance: ${attendance.length}`);
  doc.moveDown();
  
  // Add table header
  doc.fontSize(10);
  doc.text('Roll Number', 50, doc.y);
  doc.text('Timestamp', 200, doc.y);
  doc.text('Status', 400, doc.y);
  
  // Draw line under header
  doc.moveTo(50, doc.y + 5)
     .lineTo(550, doc.y + 5)
     .stroke();
  doc.moveDown(0.5);
  
  // Add attendance records
  for (const record of attendance) {
    // Check if we need a new page
    if (doc.y > 750) {
      doc.addPage();
    }
    
    doc.text(record.rollNo.toString(), 50, doc.y);
    doc.text(new Date(record.timestamp).toLocaleString(), 200, doc.y);
    doc.text(record.status, 400, doc.y);
    doc.moveDown(0.3);
  }
  
  // Finalize PDF
  doc.end();
  
  // Wait for write stream to finish
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  
  return filePath;
}

/**
 * Generates a report in the specified format
 * 
 * This is the main entry point for report generation.
 * It routes to the appropriate format generator based on the format parameter.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {string} format - Report format ('csv' or 'pdf')
 * @returns {Promise<string>} Path to the generated report file
 */
async function generateReport(sessionId, format) {
  // Normalize format to lowercase for case-insensitive comparison
  const normalizedFormat = format.toLowerCase();
  
  if (normalizedFormat === 'csv') {
    return await generateCSVReport(sessionId);
  } else if (normalizedFormat === 'pdf') {
    return await generatePDFReport(sessionId);
  } else {
    throw new Error(`Unsupported report format: ${format}`);
  }
}

module.exports = {
  generateReport,
  generateCSVReport,
  generatePDFReport
};

