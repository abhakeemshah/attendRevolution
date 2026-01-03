// server/models/session.model.js

const mongoose = require('mongoose');

/**
 * Session Schema
 * 
 * Defines the structure for attendance session documents in the database.
 * Each session is created by a teacher and has a specific course and time window.
 */
const sessionSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    index: true, // Index for faster queries on course code
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Foreign key to the User model
    required: true,
    index: true, // Index for faster queries by teacher
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;


