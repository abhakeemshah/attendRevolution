// server/controllers/report.controller.js

const reportService = require('../services/report.service');

/**
 * Handles GET /api/reports/session/:sessionId/:format
 * 
 * Generates and downloads an attendance report for a session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function generateReport(req, res, next) {
  try {
    const { sessionId, format } = req.params;
    // Optional date range filters provided as query params (ISO strings)
    const { startDate, endDate } = req.query;

    let filePath;
    if (format.toLowerCase() === 'csv') {
      filePath = await reportService.generateCSVReport(sessionId, startDate, endDate);
    } else if (format.toLowerCase() === 'pdf') {
      filePath = await reportService.generatePDFReport(sessionId, startDate, endDate);
    } else {
      const error = new Error('Unsupported report format.');
      error.status = 400;
      throw error;
    }

    res.download(filePath, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateReport,
};
