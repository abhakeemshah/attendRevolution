// server/config/database.js

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connects to the MongoDB database.
 * 
 * This function establishes a connection to the MongoDB database using the connection
 * string provided in the environment variables. It also sets up event listeners
 * for the connection to log successful connections and errors.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
