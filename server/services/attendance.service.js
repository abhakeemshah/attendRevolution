// server/services/attendance.service.js

const Attendance = require('../models/attendance.model');
const Session = require('../models/session.model');

/**
 * Marks student attendance for a session.
 *
 * @param {string} sessionId - The ID of the session.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<object>} The newly created attendance record.
 */
async function markAttendance(sessionId, studentId) {
  // Find the session
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Session not found.');
    error.status = 404;
    throw error;
  }

  // Check if the session is active
  const now = new Date();
  if (!session.isActive || now < session.startTime || now > session.endTime) {
    const error = new Error('This session is not active or has expired.');
    error.status = 400;
    throw error;
  }

  // Check if attendance has already been marked
  const existingAttendance = await Attendance.findOne({ session: sessionId, student: studentId });
  if (existingAttendance) {
    const error = new Error('You have already marked your attendance for this session.');
    error.status = 409; // Conflict
    throw error;
  }

  // Create a new attendance record
  const newAttendance = new Attendance({
    session: sessionId,
    student: studentId,
  });

  await newAttendance.save();
  return newAttendance;
}

/**
 * Retrieves all attendance records for a specific session.
 *
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<Array>} An array of attendance records, populated with student details.
 */
async function getAttendanceBySession(sessionId) {
  const attendance = await Attendance.find({ session: sessionId }).populate('student', 'name email');
  return attendance;
}

module.exports = {
  markAttendance,
  getAttendanceBySession,
};
