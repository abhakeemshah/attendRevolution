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

  await mongoose.connect(config.MONGODB_URI);

  console.log('MongoDB connected successfully.');
};

module.exports = connectDB;
