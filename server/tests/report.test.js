// server/tests/report.test.js

// Mock teacherAuth middleware to allow/deny based on header 'x-mock-auth'
jest.mock('../middlewares/teacherAuth.middleware', () => {
  return (req, res, next) => {
    if (req.headers['x-mock-auth'] === 'allow') {
      req.teacher = { _id: 'teacher-1' };
      return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
});

// Mock report service to generate small CSV/PDF files on demand
jest.mock('../services/report.service', () => ({
  generateCSVReport: jest.fn(async (sessionId) => {
    const fs = require('fs');
    const path = require('path');
    const reportDir = path.join(__dirname, '..', 'reports', 'csv');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const filePath = path.join(reportDir, `test_session_${sessionId}.csv`);
    fs.writeFileSync(filePath, 'RollNumber,ScannedAt\n2024CS101,2026-01-04T10:00:00Z');
    return filePath;
  }),
  generatePDFReport: jest.fn(async (sessionId) => {
    const fs = require('fs');
    const path = require('path');
    const reportDir = path.join(__dirname, '..', 'reports', 'pdf');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const filePath = path.join(reportDir, `test_session_${sessionId}.pdf`);
    fs.writeFileSync(filePath, '%PDF-1.4\n%fakepdf');
    return filePath;
  }),
}));

const request = require('supertest');
const app = require('../app');

describe('Report generation (teacher-only)', () => {
  it('allows an authorized teacher to download CSV', async () => {
    const res = await request(app)
      .get('/api/v1/reports/session/sess-1/csv')
      .set('x-mock-auth', 'allow')
      .expect(200);

    expect(res.headers['content-disposition']).toBeDefined();
  });

  it('allows an authorized teacher to download PDF', async () => {
    const res = await request(app)
      .get('/api/v1/reports/session/sess-1/pdf')
      .set('x-mock-auth', 'allow')
      .expect(200);

    expect(res.headers['content-disposition']).toBeDefined();
  });

  it('blocks unauthorized access', async () => {
    const res = await request(app)
      .get('/api/v1/reports/session/sess-1/csv')
      .expect(403);

    expect(res.body).toHaveProperty('success', false);
  });
});
