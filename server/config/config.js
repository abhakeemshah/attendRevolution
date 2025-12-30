/**
 * Application Configuration Module
 * 
 * This module centralizes all configuration settings for the application.
 * It reads from environment variables with sensible defaults for development.
 * 
 * Why this approach:
 * - Single source of truth for configuration
 * - Easy to override via environment variables
 * - Type-safe defaults prevent runtime errors
 */

// Server configuration constants
const SERVER_DEFAULT_PORT = 3000;
const SERVER_DEFAULT_HOST = 'localhost';

// Session duration limits (in minutes)
// These constants prevent magic numbers throughout the codebase
const SESSION_MIN_DURATION_MINUTES = 3;
const SESSION_MAX_DURATION_MINUTES = 10;
const SESSION_DEFAULT_DURATION_MINUTES = 5;

// Roll number validation limits
// These define the acceptable range for student roll numbers
const ROLL_NUMBER_MIN = 1;
const ROLL_NUMBER_MAX = 999999;

// String length limits for input validation
const CLASS_NAME_MAX_LENGTH = 50;
const SUBJECT_NAME_MAX_LENGTH = 100;
const SECTION_NAME_MAX_LENGTH = 10;

// Data storage paths
const DATA_DIRECTORY = './server/data';
const SESSIONS_FILE = `${DATA_DIRECTORY}/sessions.json`;
const ATTENDANCE_FILE = `${DATA_DIRECTORY}/attendance.json`;

// Report storage paths
const REPORTS_DIRECTORY = './reports';
const CSV_REPORTS_DIRECTORY = `${REPORTS_DIRECTORY}/csv`;
const PDF_REPORTS_DIRECTORY = `${REPORTS_DIRECTORY}/pdf`;

// Export configuration object
// This structure makes it easy to access config values throughout the app
module.exports = {
  server: {
    port: parseInt(process.env.PORT, 10) || SERVER_DEFAULT_PORT,
    host: process.env.HOST || SERVER_DEFAULT_HOST,
    environment: process.env.NODE_ENV || 'development'
  },
  
  session: {
    minDurationMinutes: parseInt(process.env.SESSION_DURATION_MIN, 10) || SESSION_MIN_DURATION_MINUTES,
    maxDurationMinutes: parseInt(process.env.SESSION_DURATION_MAX, 10) || SESSION_MAX_DURATION_MINUTES,
    defaultDurationMinutes: parseInt(process.env.DEFAULT_SESSION_DURATION, 10) || SESSION_DEFAULT_DURATION_MINUTES
  },
  
  validation: {
    rollNumberMin: ROLL_NUMBER_MIN,
    rollNumberMax: ROLL_NUMBER_MAX,
    classNameMaxLength: CLASS_NAME_MAX_LENGTH,
    subjectNameMaxLength: SUBJECT_NAME_MAX_LENGTH,
    sectionNameMaxLength: SECTION_NAME_MAX_LENGTH
  },
  
  storage: {
    type: process.env.STORAGE_TYPE || 'json',
    dataDirectory: process.env.DATA_DIR || DATA_DIRECTORY,
    sessionsFile: SESSIONS_FILE,
    attendanceFile: ATTENDANCE_FILE
  },
  
  reports: {
    directory: process.env.REPORTS_DIR || REPORTS_DIRECTORY,
    csvDirectory: process.env.CSV_DIR || CSV_REPORTS_DIRECTORY,
    pdfDirectory: process.env.PDF_DIR || PDF_REPORTS_DIRECTORY
  },
  
  cors: {
    // In production, this should be set to actual domain
    // For MVP, we allow localhost for development
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:3000']
  }
};

