// server/models/attendance.model.js

const mongoose = require('mongoose');

/**
 * Attendance Schema
 *
 * Defines the structure for attendance records. Each document represents a single
 * student's attendance for a specific session, identified by their roll number.
 */
const attendanceSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required.'],
    trim: true,
  },
  // A hash identifying the device/browser used to submit this attendance.
  // This prevents one device from submitting attendance for multiple students
  // within the same session. It is computed from the User-Agent, IP and
  // sessionId (see service implementation) and is indexed for fast lookups.
  deviceHash: {
    type: String,
    required: [true, 'Device hash is required.'],
    index: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session', // Foreign key to the Session model
    required: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'scannedAt', updatedAt: false }, // Use scannedAt as the creation timestamp
});

// Compound index to ensure a student (by rollNumber) can only be marked
// present once per session.
// Ensure a student (by rollNumber) can only be marked present once per session.
attendanceSchema.index({ sessionId: 1, rollNumber: 1 }, { unique: true });
// Ensure a device can only be used once per session.
attendanceSchema.index({ sessionId: 1, deviceHash: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

