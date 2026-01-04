// server/models/teacher.model.js

const mongoose = require('mongoose');

/**
 * Teacher Schema
 *
 * Defines the structure for teacher documents in the database.
 * Teachers are identified by a pre-generated teacherId.
 * This model does not store any personal information or credentials.
 */
const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: [true, 'Teacher ID is required.'],
    unique: true,
    trim: true,
    index: true, // Index for faster queries on teacherId
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
