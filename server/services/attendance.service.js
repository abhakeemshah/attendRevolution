// server/services/attendance.service.js

const Attendance = require('../models/attendance.model');
const Session = require('../models/session.model');

/**
 * Marks student attendance for a session using their roll number.
 *
 * @param {string} sessionId - The ID of the session.
 * @param {string} rollNumber - The roll number of the student.
 * @returns {Promise<object>} The newly created attendance record.
 */
async function markAttendance(sessionId, rollNumber) {
  // Find the session
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Session not found.');
    error.status = 404;
    throw error;
  }

  // Check if the session is active.
  // This logic is updated to work with the new Session model.
  const now = new Date();
  const sessionDate = new Date(session.date);
  const startTime = new Date(sessionDate.toDateString() + ' ' + session.timeFrom);
  const endTime = new Date(sessionDate.toDateString() + ' ' + session.timeTo);

  if (!session.isActive || now < startTime || now > endTime) {
    const error = new Error('This session is not active or has expired.');
    error.status = 400;
    throw error;
  }

  // Check if attendance has already been marked for this roll number.
  // Updated to use rollNumber and sessionId.
  const existingAttendance = await Attendance.findOne({ sessionId: sessionId, rollNumber: rollNumber });
  if (existingAttendance) {
    const error = new Error('You have already marked your attendance for this session.');
    error.status = 409; // Conflict
    throw error;
  }

  // Create a new attendance record.
  // Updated to use rollNumber and sessionId fields.
  const newAttendance = new Attendance({
    sessionId: sessionId,
    rollNumber: rollNumber,
  });

  await newAttendance.save();
  return newAttendance;
}

/**
 * Retrieves all attendance records for a specific session.
 *
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<Array>} An array of attendance records.
 */
async function getAttendanceBySession(sessionId) {
  // The 'student' field no longer exists on the Attendance model, so .populate() is removed.
  // The query now returns records with roll numbers.
  const attendance = await Attendance.find({ sessionId: sessionId });
  return attendance;
}

module.exports = {
  markAttendance,
  getAttendanceBySession,
};
