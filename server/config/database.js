// server/config/database.js

const mongoose = require('mongoose');
const config = require('./config');

/**
 * Connects to the MongoDB database using mongoose.
 * Throws on failure so the caller can decide how to handle it.
 */
const connectDB = async () => {
  if (!config.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment');
  }
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    // In development we allow starting the server even if the DB is unreachable.
    const allowFallback = process.env.SKIP_DB_ON_FAIL === 'true' || process.env.NODE_ENV !== 'production';
    console.warn('Failed to connect to MongoDB:', err && err.message ? err.message : err);
    if (allowFallback) {
      console.warn('Continuing without a database connection (development fallback enabled).');
      return;
    }
    // In production or when strict behavior is desired, rethrow to crash the startup.
    throw err;
  }
};

module.exports = connectDB;
