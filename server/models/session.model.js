// server/models/session.model.js

const mongoose = require('mongoose');

/**
 * Session Schema
 *
 * Defines the structure for attendance session documents. Each session represents
 * a single class or lab meeting for which attendance is being tracked.
 */
const sessionSchema = new mongoose.Schema({
  // Academic context of the session
  semester: {
    type: Number,
    required: [true, 'Semester is required.'],
    min: [1, 'Semester must be a positive number.'],
  },
  shift: {
    type: String,
    required: [true, 'Shift is required.'],
    trim: true,
  },
  class: { // Using 'class' might be problematic, consider 'className' or 'classIdentifier'
    type: String,
    required: [true, 'Class identifier is required.'],
    trim: true,
  },
  group: {
    type: String,
    trim: true, // Optional field
  },
  date: {
    type: Date,
    required: [true, 'Session date is required.'],
    default: Date.now,
  },
  // Type of session (e.g., lecture or lab)
  type: {
    type: String,
    enum: ['theory', 'practical'],
    required: [true, 'Session type is required.'],
  },
  // Course details for the session
  courseName: {
    type: String,
    required: [true, 'Course name is required.'],
    trim: true,
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required.'],
    trim: true,
    index: true, // Index for faster queries on courseCode
  },
  // Time window for the session
  timeFrom: {
    type: String, // Storing as string e.g., "09:00"
    required: [true, 'Start time is required.'],
  },
  timeTo: {
    type: String, // Storing as string e.g., "10:30"
    required: [true, 'End time is required.'],
  },
  // Link to the teacher conducting the session
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // Foreign key to the new Teacher model
    required: true,
    index: true, // Index for faster queries by teacher
  },
  // QR code and session status
  qrToken: {
    type: String,
    required: true,
    unique: true, // Each session must have a unique QR token
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Compound index to ensure a teacher cannot create duplicate sessions
// for the same course, class, and time slot.
sessionSchema.index({ teacherId: 1, courseCode: 1, date: 1, timeFrom: 1 }, { unique: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

