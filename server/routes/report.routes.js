/**
 * Report Routes
 * 
 * This module defines HTTP routes for report generation.
 * Handles CSV and PDF report downloads.
 * 
 * Why separate routes:
 * - Reports have different response types (file downloads)
 * - Easy to add caching middleware later
 * - Clear separation of concerns
 */

const express = require('express');
const router = express.Router();
const reportService = require('../services/report.service');
const sessionService = require('../services/session.service');
const path = require('path');
const fs = require('fs').promises;

/**
 * GET /api/session/:sessionId/report
 * 
 * Generates and downloads attendance report.
 * URL parameter: sessionId (UUID)
 * Query parameter: format (csv or pdf, default: csv)
 */
router.get('/:sessionId/report', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const format = req.query.format || 'csv'; // Default to CSV if not specified
    
    // Validate session exists
    const session = await sessionService.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    // Generate report file
    const filePath = await reportService.generateReport(sessionId, format);
    
    // Determine content type based on format
    const contentType = format.toLowerCase() === 'pdf' 
      ? 'application/pdf' 
      : 'text/csv';
    
    // Generate filename for download
    const dateString = new Date(session.startTime).toISOString().split('T')[0];
    const extension = format.toLowerCase() === 'pdf' ? 'pdf' : 'csv';
    const filename = `attendance_report_${dateString}.${extension}`;
    
    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Read file and send to client
    const fileContent = await fs.readFile(filePath);
    res.send(fileContent);
  } catch (error) {
    console.error('Error generating report:', error.message);
    
    // Handle specific errors
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    if (error.message.includes('Unsupported report format')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Report format must be csv or pdf'
        }
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate report'
      }
    });
  }
});

module.exports = router;

