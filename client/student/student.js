/**
 * Student Interface JavaScript
 * 
 * This module handles QR code scanning and attendance submission.
 * Optimized for mobile devices with camera access.
 * 
 * Why this structure:
 * - Clear separation of concerns
 * - Mobile-friendly error handling
 * - Efficient QR code scanning
 * - User-friendly feedback
 */

// API base URL - change this if your server runs on a different port
const API_BASE_URL = 'http://localhost:3000/api';

// Camera and scanning state
let stream = null;
let scanningInterval = null;
let isScanning = false;

/**
 * Shows a message to the user
 * 
 * Provides feedback for user actions and errors.
 * 
 * @param {string} message - Message text to display
 * @param {string} type - Message type: 'success', 'error', or 'info'
 */
function showMessage(message, type = 'info') {
  const messageArea = document.getElementById('messageArea');
  
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;
  
  messageArea.appendChild(messageElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

/**
 * Displays status card with result
 * 
 * Shows success or error status after attendance submission.
 * 
 * @param {string} title - Status title
 * @param {string} message - Status message
 * @param {string} type - Status type: 'success', 'error', or 'info'
 */
function showStatus(title, message, type) {
  const statusSection = document.getElementById('statusSection');
  const statusCard = document.getElementById('statusCard');
  const statusTitle = document.getElementById('statusTitle');
  const statusMessage = document.getElementById('statusMessage');
  
  statusCard.className = `status-card ${type}`;
  statusTitle.textContent = title;
  statusMessage.textContent = message;
  
  statusSection.style.display = 'block';
  
  // Hide after 10 seconds for success, 15 for error
  const timeout = type === 'success' ? 10000 : 15000;
  setTimeout(() => {
    statusSection.style.display = 'none';
  }, timeout);
}

/**
 * Starts camera for QR code scanning
 * 
 * Requests camera access and starts video stream.
 * Uses getUserMedia API for camera access.
 */
async function startCamera() {
  try {
    // Request camera access
    // We prefer rear camera (facing environment) for better QR scanning
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use rear camera if available
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    const videoElement = document.getElementById('videoElement');
    const placeholder = document.getElementById('scannerPlaceholder');
    
    // Show video element and hide placeholder
    videoElement.srcObject = stream;
    videoElement.style.display = 'block';
    placeholder.style.display = 'none';
    
    // Start scanning for QR codes
    startQRScanning();
    
  } catch (error) {
    console.error('Error accessing camera:', error);
    
    if (error.name === 'NotAllowedError') {
      showMessage('Camera access denied. Please allow camera access and try again.', 'error');
    } else if (error.name === 'NotFoundError') {
      showMessage('No camera found. Please use manual entry.', 'error');
    } else {
      showMessage('Failed to access camera. Please use manual entry.', 'error');
    }
  }
}

/**
 * Stops camera stream
 * 
 * Releases camera resources when done scanning.
 */
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  const videoElement = document.getElementById('videoElement');
  const placeholder = document.getElementById('scannerPlaceholder');
  
  videoElement.style.display = 'none';
  placeholder.style.display = 'flex';
  
  stopQRScanning();
}

/**
 * Starts QR code scanning
 * 
 * Periodically checks video frame for QR codes.
 * Uses canvas to capture frames and decode QR data.
 */
function startQRScanning() {
  if (isScanning) {
    return;
  }
  
  isScanning = true;
  const videoElement = document.getElementById('videoElement');
  const canvasElement = document.getElementById('canvasElement');
  const context = canvasElement.getContext('2d');
  
  // Scan every 500ms
  scanningInterval = setInterval(() => {
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      // Capture frame from video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      // Get image data for QR code detection
      const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
      
      // Try to decode QR code
      // Note: In a real implementation, you would use a QR code library like jsQR
      // For this MVP, we'll use a simple pattern matching approach
      // TODO: Integrate jsQR library for proper QR code detection
      tryDecodeQRCode(imageData);
    }
  }, 500);
}

/**
 * Stops QR code scanning
 */
function stopQRScanning() {
  if (scanningInterval) {
    clearInterval(scanningInterval);
    scanningInterval = null;
  }
  isScanning = false;
}

/**
 * Attempts to decode QR code from image data
 * 
 * This is a placeholder. In production, use a proper QR code library.
 * For now, we'll rely on manual entry or URL-based QR codes.
 * 
 * @param {ImageData} imageData - Image data from canvas
 */
function tryDecodeQRCode(imageData) {
  // TODO: Implement QR code decoding using jsQR or similar library
  // For MVP, we'll use manual entry as primary method
}

/**
 * Parses QR code data string
 * 
 * Extracts sessionId from QR code data format.
 * Format: "sessionId=<uuid>&expiry=<timestamp>"
 * 
 * @param {string} qrData - QR code data string
 * @returns {string|null} Session ID if valid, null otherwise
 */
function parseQRData(qrData) {
  try {
    const params = new URLSearchParams(qrData);
    const sessionId = params.get('sessionId');
    
    if (sessionId) {
      return sessionId;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
}

/**
 * Marks attendance for a student
 * 
 * Sends attendance submission to the API.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {number} rollNo - Student roll number
 */
async function markAttendance(sessionId, rollNo) {
  try {
    // Disable submit button to prevent double submission
    const submitBtn = document.getElementById('submitAttendanceBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Send request to API
    const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        rollNo: rollNo
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success status
      showStatus('Success!', 'Your attendance has been marked successfully.', 'success');
      showMessage('Attendance marked successfully!', 'success');
      
      // Reset form
      document.getElementById('manualForm').reset();
      
      // Stop camera if running
      stopCamera();
    } else {
      // Handle API errors
      const errorCode = result.error?.code;
      const errorMessage = result.error?.message || 'Failed to mark attendance';
      
      if (errorCode === 'DUPLICATE_ENTRY') {
        showStatus('Already Marked', 'You have already marked attendance for this session.', 'info');
        showMessage('Attendance already recorded', 'info');
      } else if (errorCode === 'SESSION_EXPIRED' || errorCode === 'SESSION_INACTIVE') {
        showStatus('Session Expired', 'This attendance session is no longer active.', 'error');
        showMessage(errorMessage, 'error');
      } else if (errorCode === 'SESSION_NOT_FOUND') {
        showStatus('Invalid Session', 'Session not found. Please check the session ID.', 'error');
        showMessage('Invalid session ID', 'error');
      } else {
        showStatus('Error', errorMessage, 'error');
        showMessage(errorMessage, 'error');
      }
    }
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Mark Attendance';
    
  } catch (error) {
    console.error('Error marking attendance:', error);
    showStatus('Network Error', 'Please check your internet connection and try again.', 'error');
    showMessage('Network error. Please try again.', 'error');
    
    const submitBtn = document.getElementById('submitAttendanceBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Mark Attendance';
  }
}

// Event Listeners

// Start camera button
document.getElementById('startCameraBtn').addEventListener('click', () => {
  startCamera();
});

// Manual form submission
document.getElementById('manualForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const sessionId = document.getElementById('sessionIdInput').value.trim();
  const rollNo = parseInt(document.getElementById('rollNoInput').value, 10);
  
  // Validate input
  if (!sessionId) {
    showMessage('Please enter session ID', 'error');
    return;
  }
  
  if (!rollNo || isNaN(rollNo) || rollNo < 1) {
    showMessage('Please enter a valid roll number', 'error');
    return;
  }
  
  markAttendance(sessionId, rollNo);
});

// Stop camera when page is hidden (saves resources)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && stream) {
    stopCamera();
  }
});

// Clean up camera on page unload
window.addEventListener('beforeunload', () => {
  stopCamera();
});

