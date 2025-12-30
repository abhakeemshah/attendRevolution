/**
 * Time Utility Module
 * 
 * This module provides time-related helper functions for the application.
 * Centralizing time operations ensures consistency and makes testing easier.
 * 
 * Why separate utilities:
 * - Reusable across different services
 * - Easy to test independently
 * - Consistent date/time formatting throughout the app
 */

/**
 * Gets the current time as an ISO 8601 formatted string
 * 
 * We use ISO 8601 format because:
 * - It's a standard format that's easy to parse
 * - Works well with JSON serialization
 * - Compatible with most databases and APIs
 * 
 * @returns {string} Current time in ISO 8601 format (e.g., "2026-01-15T10:00:00.000Z")
 */
function getCurrentTimeISO() {
  return new Date().toISOString();
}

/**
 * Adds minutes to a given date and returns ISO string
 * 
 * This is used to calculate session end times based on duration.
 * We add minutes to the start time to get the expiration time.
 * 
 * @param {Date|string} startTime - The starting time (Date object or ISO string)
 * @param {number} minutesToAdd - Number of minutes to add
 * @returns {string} New time in ISO 8601 format
 */
function addMinutesToTime(startTime, minutesToAdd) {
  const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const endDate = new Date(startDate.getTime() + minutesToAdd * 60 * 1000);
  return endDate.toISOString();
}

/**
 * Checks if a given time has passed (is in the past)
 * 
 * This is critical for session expiry validation.
 * We compare the current time with the expiry time to determine if a session is still valid.
 * 
 * @param {Date|string} expiryTime - The time to check (Date object or ISO string)
 * @returns {boolean} True if the time has passed, false otherwise
 */
function hasTimePassed(expiryTime) {
  const expiryDate = typeof expiryTime === 'string' ? new Date(expiryTime) : expiryTime;
  const now = new Date();
  return now > expiryDate;
}

/**
 * Calculates the remaining time in seconds until expiry
 * 
 * This is used to show countdown timers in the UI.
 * Returns 0 if the time has already passed.
 * 
 * @param {Date|string} expiryTime - The expiry time (Date object or ISO string)
 * @returns {number} Remaining seconds until expiry, or 0 if expired
 */
function getRemainingSeconds(expiryTime) {
  const expiryDate = typeof expiryTime === 'string' ? new Date(expiryTime) : expiryTime;
  const now = new Date();
  const differenceMs = expiryDate.getTime() - now.getTime();
  
  // Return 0 if time has already passed (negative difference)
  if (differenceMs <= 0) {
    return 0;
  }
  
  // Convert milliseconds to seconds
  return Math.floor(differenceMs / 1000);
}

/**
 * Validates if a string is a valid ISO 8601 date format
 * 
 * This prevents invalid date strings from causing errors.
 * We validate before parsing to catch format issues early.
 * 
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid ISO 8601 format, false otherwise
 */
function isValidISO8601(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }
  
  // ISO 8601 regex pattern
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (!iso8601Pattern.test(dateString)) {
    return false;
  }
  
  // Try to parse and check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  getCurrentTimeISO,
  addMinutesToTime,
  hasTimePassed,
  getRemainingSeconds,
  isValidISO8601
};

