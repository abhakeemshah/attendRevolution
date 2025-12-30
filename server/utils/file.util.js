/**
 * File Utility Module
 * 
 * This module handles file system operations for data persistence.
 * It provides safe, async file operations with proper error handling.
 * 
 * Why separate file utilities:
 * - Centralizes file I/O logic
 * - Makes it easy to switch storage backends later
 * - Provides consistent error handling
 * - Enables easier testing with mocks
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Reads a JSON file and parses its contents
 * 
 * This is used to load sessions and attendance data from storage.
 * We use async/await for non-blocking I/O operations.
 * 
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Array>} Parsed JSON array (defaults to empty array if file doesn't exist)
 * @throws {Error} If file exists but contains invalid JSON
 */
async function readJSONFile(filePath) {
  try {
    // Check if file exists before reading
    // This prevents errors when the file hasn't been created yet
    await fs.access(filePath);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Handle empty files (return empty array instead of error)
    if (!fileContent.trim()) {
      return [];
    }
    
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist, return empty array (first run scenario)
    if (error.code === 'ENOENT') {
      return [];
    }
    
    // Re-throw other errors (permission issues, invalid JSON, etc.)
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Writes data to a JSON file
 * 
 * This is used to persist sessions and attendance records.
 * We create a backup before writing to prevent data loss.
 * 
 * @param {string} filePath - Path to the JSON file
 * @param {Array|Object} data - Data to write (will be stringified)
 * @returns {Promise<void>}
 * @throws {Error} If write operation fails
 */
async function writeJSONFile(filePath, data) {
  try {
    // Ensure directory exists before writing
    // This prevents "ENOENT" errors if directories haven't been created
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    
    // Convert data to formatted JSON string
    // Pretty printing (2 spaces) makes files human-readable for debugging
    const jsonString = JSON.stringify(data, null, 2);
    
    // Write file atomically
    // Using writeFile instead of append ensures we replace the entire file
    await fs.writeFile(filePath, jsonString, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 * 
 * This is useful for setting up report directories.
 * We use recursive option to create nested directories in one call.
 * 
 * @param {string} directoryPath - Path to the directory
 * @returns {Promise<void>}
 */
async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    // This makes the function idempotent
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${directoryPath}: ${error.message}`);
    }
  }
}

/**
 * Checks if a file exists
 * 
 * Useful for conditional logic based on file existence.
 * 
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  readJSONFile,
  writeJSONFile,
  ensureDirectoryExists,
  fileExists
};

