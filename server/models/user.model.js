// server/models/user.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * 
 * Defines the structure for user documents in the database.
 * Users can have one of two roles: 'student' or 'teacher'.
 * Passwords are automatically hashed before saving.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'teacher'],
      message: '{VALUE} is not a supported role',
    },
    default: 'student',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with hashed password in the database.
 *
 * @param {string} enteredPassword The password to compare.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
