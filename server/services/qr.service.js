/**
 * QR Code Service
 * 
 * This module handles QR code generation for attendance sessions.
 * QR codes contain session information that students scan to mark attendance.
 * 
 * Why separate QR service:
 * - Encapsulates QR code generation logic
 * - Easy to change QR code library or format later
 * - Reusable across different parts of the application
 * - Makes testing easier
 */

const QRCode = require('qrcode');

/**
 * Generates a QR code for an attendance session
 * 
 * The QR code contains encoded session data that students scan.
 * We encode sessionId and expiry time so the student interface can validate it.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {string} expiryTime - ISO 8601 timestamp when session expires
 * @returns {Promise<Object>} Object containing QR code image data and raw data string
 */
async function generateQRCode(sessionId, expiryTime) {
  try {
    // Encode session data as URL-encoded string
    // Format: sessionId=<id>&expiry=<timestamp>
    // This format is easy to parse on the client side
    const qrData = `sessionId=${sessionId}&expiry=${expiryTime}`;
    
    // Generate QR code as data URL (base64 encoded PNG)
    // Data URL format allows embedding directly in HTML img src
    // Error correction level 'M' provides good balance of size and reliability
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300, // Size in pixels - readable on mobile screens
      margin: 2 // White border around QR code
    });
    
    return {
      qrCode: qrCodeDataURL, // Base64 data URL for embedding in HTML
      qrData: qrData // Raw data string for manual parsing if needed
    };
  } catch (error) {
    // If QR generation fails, we can't create a session
    // This is a critical error that should be logged
    console.error('Error generating QR code:', error.message);
    throw new Error('Failed to generate QR code for session');
  }
}

/**
 * Parses QR code data string
 * 
 * This extracts sessionId and expiry from the QR code data.
 * Used when a student scans a QR code.
 * 
 * @param {string} qrDataString - The data string from QR code (format: "sessionId=...&expiry=...")
 * @returns {Object|null} Object with sessionId and expiry, or null if invalid format
 */
function parseQRCodeData(qrDataString) {
  try {
    // Parse URL-encoded string format
    const params = {};
    const pairs = qrDataString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value);
    }
    
    // Validate that we have required fields
    if (!params.sessionId || !params.expiry) {
      return null;
    }
    
    return {
      sessionId: params.sessionId,
      expiry: params.expiry
    };
  } catch (error) {
    // If parsing fails, return null to indicate invalid QR code
    return null;
  }
}

module.exports = {
  generateQRCode,
  parseQRCodeData
};

