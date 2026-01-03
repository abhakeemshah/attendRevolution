// server/models/attendance.model.js

const mongoose = require('mongoose');

/**
 * Attendance Schema
 * 
 * Defines the structure for attendance records in the database.
 * Each record links a student to a specific session.
 * A unique compound index on session and student prevents duplicate entries.
 */
const attendanceSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session', // Foreign key to the Session model
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Foreign key to the User model
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a student can only attend a session once
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;


