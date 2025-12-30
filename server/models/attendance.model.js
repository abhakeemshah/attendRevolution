/**
 * Attendance Model
 * 
 * This module handles data persistence for attendance records.
 * It provides methods to create, read, and query attendance data.
 * 
 * Why separate model layer:
 * - Keeps data access logic separate from business logic
 * - Makes it easy to migrate to MongoDB later
 * - Provides a clean interface for attendance operations
 * - Centralizes duplicate checking logic
 */

const fileUtil = require('../utils/file.util');
const config = require('../config/config');

/**
 * Retrieves all attendance records from storage
 * 
 * This loads the entire attendance array from the JSON file.
 * In production, we'd use database queries with filters instead.
 * 
 * @returns {Promise<Array>} Array of attendance record objects
 */
async function getAllAttendance() {
  try {
    const attendance = await fileUtil.readJSONFile(config.storage.attendanceFile);
    return attendance;
  } catch (error) {
    console.error('Error reading attendance:', error.message);
    throw new Error('Failed to retrieve attendance from storage');
  }
}

/**
 * Retrieves all attendance records for a specific session
 * 
 * This filters attendance records by sessionId.
 * Used when generating reports or showing attendance for a session.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Array>} Array of attendance records for the session
 */
async function getAttendanceBySession(sessionId) {
  try {
    const attendance = await getAllAttendance();
    // Filter records that match the session ID
    return attendance.filter(record => record.sessionId === sessionId);
  } catch (error) {
    console.error('Error finding attendance by session:', error.message);
    throw new Error('Failed to retrieve attendance records from storage');
  }
}

/**
 * Checks if a roll number has already marked attendance for a session
 * 
 * This is critical for preventing duplicate entries.
 * We check both sessionId and rollNo to ensure uniqueness.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {number} rollNo - Student roll number
 * @returns {Promise<boolean>} True if duplicate exists, false otherwise
 */
async function checkDuplicate(sessionId, rollNo) {
  try {
    const attendance = await getAllAttendance();
    
    // Search for existing record with same sessionId and rollNo
    const duplicate = attendance.find(
      record => record.sessionId === sessionId && record.rollNo === rollNo
    );
    
    return duplicate !== undefined;
  } catch (error) {
    console.error('Error checking duplicate:', error.message);
    // If we can't check, assume duplicate exists to be safe
    throw new Error('Failed to check for duplicate attendance');
  }
}

/**
 * Retrieves a specific attendance record
 * 
 * Useful for checking if a student has marked attendance.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {number} rollNo - Student roll number
 * @returns {Promise<Object|null>} Attendance record if found, null otherwise
 */
async function getAttendanceRecord(sessionId, rollNo) {
  try {
    const attendance = await getAllAttendance();
    const record = attendance.find(
      record => record.sessionId === sessionId && record.rollNo === rollNo
    );
    return record || null;
  } catch (error) {
    console.error('Error finding attendance record:', error.message);
    throw new Error('Failed to retrieve attendance record from storage');
  }
}

/**
 * Saves a new attendance record to storage
 * 
 * This adds an attendance record to the array and persists it.
 * We append to maintain chronological order.
 * 
 * @param {Object} attendanceData - Attendance record object to save
 * @returns {Promise<Object>} The saved attendance record
 */
async function createAttendanceRecord(attendanceData) {
  try {
    const attendance = await getAllAttendance();
    
    // Add the new record to the array
    attendance.push(attendanceData);
    
    // Write the updated array back to the file
    await fileUtil.writeJSONFile(config.storage.attendanceFile, attendance);
    
    return attendanceData;
  } catch (error) {
    console.error('Error creating attendance record:', error.message);
    throw new Error('Failed to save attendance record to storage');
  }
}

/**
 * Counts total attendance records for a session
 * 
 * This is used to show attendance count to teachers.
 * More efficient than loading all records and counting in memory.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<number>} Count of attendance records
 */
async function countAttendanceBySession(sessionId) {
  try {
    const attendance = await getAttendanceBySession(sessionId);
    return attendance.length;
  } catch (error) {
    console.error('Error counting attendance:', error.message);
    throw new Error('Failed to count attendance records');
  }
}

module.exports = {
  getAllAttendance,
  getAttendanceBySession,
  checkDuplicate,
  getAttendanceRecord,
  createAttendanceRecord,
  countAttendanceBySession
};

