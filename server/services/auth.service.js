// server/services/auth.service.js

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * Registers a new user.
 *
 * @param {object} userData - The user's data.
 * @returns {Promise<object>} The newly created user.
 */
async function register(userData) {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User with this email already exists.');
    error.status = 409; // Conflict
    throw error;
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    password,
    role,
  });

  await newUser.save();
  return newUser;
}

/**
 * Logs in a user.
 *
 * @param {object} credentials - The user's login credentials.
 * @returns {Promise<object>} An object containing the JWT and user information.
 */
async function login(credentials) {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401; // Unauthorized
    throw error;
  }

  // Check if user is approved
  if (!user.isApproved) {
    const error = new Error('Your account is pending approval by an administrator.');
    error.status = 403; // Forbidden
    throw error;
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401; // Unauthorized
    throw error;
  }

  // Create JWT
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, user };
}

module.exports = {
  register,
  login,
};
