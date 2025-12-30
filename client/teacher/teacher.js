/**
 * Teacher Interface JavaScript
 * 
 * This module handles all client-side logic for the teacher dashboard.
 * It manages session creation, QR code display, and attendance monitoring.
 * 
 * Why this structure:
 * - Clear separation of concerns
 * - Easy to maintain and debug
 * - Reusable functions
 * - Proper error handling
 */

// API base URL - change this if your server runs on a different port
const API_BASE_URL = 'http://localhost:3000/api';

// Current active session data
let currentSession = null;
let sessionRefreshInterval = null;

/**
 * Shows a message to the user
 * 
 * This provides user feedback for success, error, and info messages.
 * Messages automatically disappear after a few seconds.
 * 
 * @param {string} message - The message text to display
 * @param {string} type - Message type: 'success', 'error', or 'info'
 */
function showMessage(message, type = 'info') {
  const messageArea = document.getElementById('messageArea');
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;
  
  // Add to message area
  messageArea.appendChild(messageElement);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

/**
 * Formats seconds into MM:SS format
 * 
 * This converts remaining seconds into a readable time format.
 * Used for displaying countdown timer.
 * 
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTime(seconds) {
  if (seconds <= 0) {
    return '00:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Starts a new attendance session
 * 
 * This sends a request to the API to create a session.
 * On success, displays the QR code and starts monitoring.
 * 
 * @param {Object} sessionData - Object containing class, subject, section, duration
 */
async function startSession(sessionData) {
  try {
    // Disable form button to prevent double submission
    const startBtn = document.getElementById('startSessionBtn');
    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    
    // Send request to API
    const response = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store session data
      currentSession = result.data;
      
      // Display active session section
      displayActiveSession(result.data);
      
      // Start refreshing session status
      startSessionRefresh(result.data.sessionId);
      
      // Show success message
      showMessage('Session started successfully!', 'success');
      
      // Reset form
      document.getElementById('sessionForm').reset();
    } else {
      // Handle API error
      const errorMessage = result.error?.message || 'Failed to start session';
      showMessage(errorMessage, 'error');
      startBtn.disabled = false;
      startBtn.textContent = 'Start Session';
    }
  } catch (error) {
    // Handle network or other errors
    console.error('Error starting session:', error);
    showMessage('Network error. Please check your connection.', 'error');
    
    const startBtn = document.getElementById('startSessionBtn');
    startBtn.disabled = false;
    startBtn.textContent = 'Start Session';
  }
}

/**
 * Displays active session information
 * 
 * This updates the UI to show session details and QR code.
 * 
 * @param {Object} sessionData - Session object from API
 */
function displayActiveSession(sessionData) {
  // Show active session section
  document.getElementById('activeSessionSection').style.display = 'block';
  
  // Update session info
  document.getElementById('activeClassName').textContent = sessionData.class;
  document.getElementById('activeSubject').textContent = sessionData.subject;
  document.getElementById('activeSection').textContent = sessionData.section;
  
  // Display QR code
  const qrImage = document.getElementById('qrCodeImage');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  
  if (sessionData.qrCode) {
    qrImage.src = sessionData.qrCode;
    qrImage.style.display = 'block';
    qrPlaceholder.style.display = 'none';
  }
  
  // Update attendance count
  updateSessionStatus(sessionData.sessionId);
}

/**
 * Refreshes session status periodically
 * 
 * This polls the API to get updated attendance count and time remaining.
 * Updates the UI every few seconds while session is active.
 * 
 * @param {string} sessionId - UUID of the session
 */
function startSessionRefresh(sessionId) {
  // Clear any existing interval
  if (sessionRefreshInterval) {
    clearInterval(sessionRefreshInterval);
  }
  
  // Refresh immediately
  updateSessionStatus(sessionId);
  
  // Then refresh every 3 seconds
  sessionRefreshInterval = setInterval(() => {
    updateSessionStatus(sessionId);
  }, 3000);
}

/**
 * Updates session status display
 * 
 * Fetches current session status and updates the UI.
 * 
 * @param {string} sessionId - UUID of the session
 */
async function updateSessionStatus(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const sessionData = result.data;
      
      // Update time remaining
      const timeRemaining = formatTime(sessionData.timeRemaining);
      document.getElementById('timeRemaining').textContent = timeRemaining;
      
      // Update attendance count
      document.getElementById('attendanceCount').textContent = sessionData.attendanceCount;
      
      // Stop refreshing if session is no longer active
      if (!sessionData.isActive || sessionData.timeRemaining <= 0) {
        stopSessionRefresh();
        showMessage('Session has ended', 'info');
      }
    }
  } catch (error) {
    console.error('Error updating session status:', error);
  }
}

/**
 * Stops the session refresh interval
 */
function stopSessionRefresh() {
  if (sessionRefreshInterval) {
    clearInterval(sessionRefreshInterval);
    sessionRefreshInterval = null;
  }
}

/**
 * Ends the current session
 * 
 * Sends a request to the API to end the session.
 * 
 * @param {string} sessionId - UUID of the session
 */
async function endSession(sessionId) {
  if (!confirm('Are you sure you want to end this session?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Session ended successfully', 'success');
      stopSessionRefresh();
      document.getElementById('activeSessionSection').style.display = 'none';
      currentSession = null;
    } else {
      showMessage(result.error?.message || 'Failed to end session', 'error');
    }
  } catch (error) {
    console.error('Error ending session:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

/**
 * Downloads attendance report
 * 
 * Generates and downloads a CSV report for the current session.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {string} format - Report format ('csv' or 'pdf')
 */
async function downloadReport(sessionId, format = 'csv') {
  try {
    const url = `${API_BASE_URL}/session/${sessionId}/report?format=${format}`;
    
    // Open in new window to trigger download
    window.open(url, '_blank');
    
    showMessage('Report download started', 'success');
  } catch (error) {
    console.error('Error downloading report:', error);
    showMessage('Failed to download report', 'error');
  }
}

// Event Listeners

// Handle form submission
document.getElementById('sessionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    class: document.getElementById('className').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    section: document.getElementById('section').value.trim(),
    duration: parseInt(document.getElementById('duration').value, 10)
  };
  
  // Validate form data
  if (!formData.class || !formData.subject || !formData.section) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  startSession(formData);
});

// Handle refresh button
document.getElementById('refreshSessionBtn').addEventListener('click', () => {
  if (currentSession) {
    updateSessionStatus(currentSession.sessionId);
    showMessage('Status refreshed', 'info');
  }
});

// Handle end session button
document.getElementById('endSessionBtn').addEventListener('click', () => {
  if (currentSession) {
    endSession(currentSession.sessionId);
  }
});

// Handle download report button
document.getElementById('downloadReportBtn').addEventListener('click', () => {
  if (currentSession) {
    downloadReport(currentSession.sessionId, 'csv');
  } else {
    showMessage('No active session', 'error');
  }
});

