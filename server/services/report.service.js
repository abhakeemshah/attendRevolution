// server/services/report.service.js

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Attendance = require('../models/attendance.model');
const Session = require('../models/session.model');

// Helper: build a Mongo filter for optional date range
function buildDateFilter(startDate, endDate) {
  const filter = {};
  if (startDate) {
    const s = new Date(startDate);
    if (!isNaN(s)) filter.$gte = s;
  }
  if (endDate) {
    const e = new Date(endDate);
    if (!isNaN(e)) filter.$lte = e;
  }
  return Object.keys(filter).length ? { scannedAt: filter } : {};
}

/**
 * Generates a CSV report for a session.
 *
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<string>} Path to the generated CSV file.
 */
async function generateCSVReport(sessionId, startDate, endDate) {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  // Build optimized query with projection and optional date filter.
  const dateFilter = buildDateFilter(startDate, endDate);
  const query = { sessionId: sessionId, ...dateFilter };
  const attendanceRecords = await Attendance.find(query)
    .select('rollNumber scannedAt -_id')
    .sort({ scannedAt: 1 })
    .lean();

  const reportDir = path.join(__dirname, '..', 'reports', 'csv');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const filePath = path.join(reportDir, `session_${sessionId}_report.csv`);
  
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'rollNumber', title: 'RollNumber' },
      { id: 'scannedAt', title: 'ScannedAt' },
    ],
  });

  const records = attendanceRecords.map(att => ({
    rollNumber: att.rollNumber,
    scannedAt: new Date(att.scannedAt).toISOString(),
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
async function generatePDFReport(sessionId, startDate, endDate) {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  const dateFilter = buildDateFilter(startDate, endDate);
  const query = { sessionId: sessionId, ...dateFilter };
  const attendanceRecords = await Attendance.find(query)
    .select('rollNumber scannedAt -_id')
    .sort({ scannedAt: 1 })
    .lean();
  
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

  // Session Details (best-effort; fields may vary)
  doc.fontSize(12);
  doc.text(`Course: ${session.courseName || ''} (${session.courseCode || ''})`);
  doc.text(`Date: ${session.date ? new Date(session.date).toLocaleDateString() : ''}`);
  doc.text(`Time: ${session.timeFrom || ''} - ${session.timeTo || ''}`);
  doc.text(`Total Attendance: ${attendanceRecords.length}`);
  doc.moveDown(2);

  // Table Header
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Name', 50, doc.y);
  doc.text('Email', 200, doc.y);
  doc.text('Timestamp', 400, doc.y);
  doc.moveDown();
  doc.font('Helvetica');

  // Table Rows (rollNumber + scannedAt)
  attendanceRecords.forEach(att => {
    doc.text(att.rollNumber, 50, doc.y);
    doc.text(new Date(att.scannedAt).toLocaleString(), 300, doc.y);
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


