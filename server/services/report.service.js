// server/services/report.service.js

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Attendance = require('../models/attendance.model');
const Session = require('../models/session.model');

/**
 * Generates a CSV report for a session.
 *
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<string>} Path to the generated CSV file.
 */
async function generateCSVReport(sessionId) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const attendanceRecords = await Attendance.find({ session: sessionId }).populate('student', 'name email');

  const reportDir = path.join(__dirname, '..', 'reports', 'csv');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const filePath = path.join(reportDir, `session_${sessionId}_report.csv`);
  
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'timestamp', title: 'Timestamp' },
    ],
  });

  const records = attendanceRecords.map(att => ({
    name: att.student.name,
    email: att.student.email,
    timestamp: att.timestamp.toISOString(),
  }));

  await csvWriter.writeRecords(records);
  return filePath;
}

/**
 * Generates a PDF report for a session.
 *
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<string>} Path to the generated PDF file.
 */
async function generatePDFReport(sessionId) {
  const session = await Session.findById(sessionId).populate('createdBy', 'name');
  if (!session) {
    throw new Error('Session not found');
  }

  const attendanceRecords = await Attendance.find({ session: sessionId }).populate('student', 'name email');
  
  const reportDir = path.join(__dirname, '..', 'reports', 'pdf');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const filePath = path.join(reportDir, `session_${sessionId}_report.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Header
  doc.fontSize(20).text('Attendance Report', { align: 'center' });
  doc.moveDown();

  // Session Details
  doc.fontSize(12);
  doc.text(`Course: ${session.courseName} (${session.courseCode})`);
  doc.text(`Date: ${session.startTime.toLocaleDateString()}`);
  doc.text(`Time: ${session.startTime.toLocaleTimeString()} - ${session.endTime.toLocaleTimeString()}`);
  doc.text(`Teacher: ${session.createdBy.name}`);
  doc.text(`Total Attendance: ${attendanceRecords.length}`);
  doc.moveDown(2);

  // Table Header
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Name', 50, doc.y);
  doc.text('Email', 200, doc.y);
  doc.text('Timestamp', 400, doc.y);
  doc.moveDown();
  doc.font('Helvetica');

  // Table Rows
  attendanceRecords.forEach(att => {
    doc.text(att.student.name, 50, doc.y);
    doc.text(att.student.email, 200, doc.y);
    doc.text(att.timestamp.toLocaleString(), 400, doc.y);
    doc.moveDown(0.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}

module.exports = {
  generateCSVReport,
  generatePDFReport,
};


