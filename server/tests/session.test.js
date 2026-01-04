// server/tests/session.test.js

// Mock the teacherAuth middleware and the session service before importing the app
// so that routes use the mocked implementations and no database connection is required.
jest.mock('../middlewares/teacherAuth.middleware', () => {
  return (req, res, next) => {
    // Attach a fake teacher document to the request to simulate an authenticated teacher
    req.teacher = { _id: '507f1f77bcf86cd799439011', teacherId: 'T-TEST-001' };
    next();
  };
});

// Mock the session service to avoid touching the database during tests
const mockCreatedSession = {
  _id: 'sess-test-123',
  qrToken: 'qr-test-token-abc',
};

jest.mock('../services/session.service', () => ({
  createSession: jest.fn(async (sessionData, teacherId) => {
    // Return a fake session object that resembles the Mongoose document
    return { ...mockCreatedSession, ...sessionData, teacherId };
  }),
}));

const request = require('supertest');
const app = require('../app');

describe('Session Creation API', () => {
  /**
   * Success scenario:
   * POST /api/v1/sessions with valid payload should return 201 and
   * a JSON body containing `sessionId` and `qrToken`.
   */
  it('creates a session successfully with valid input', async () => {
    const validPayload = {
      semester: 2,
      shift: 'Morning',
      class: 'CS-101',
      date: '2026-01-04',
      type: 'theory',
      courseName: 'Intro to Testing',
      courseCode: 'CS101',
      timeFrom: '09:00',
      timeTo: '10:30',
    };

    const res = await request(app)
      .post('/api/v1/sessions')
      .set('Accept', 'application/json')
      .send(validPayload)
      .expect('Content-Type', /json/)
      .expect(201);

    // Response shape assertions
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('sessionId', mockCreatedSession._id);
    expect(res.body.data).toHaveProperty('qrToken', mockCreatedSession.qrToken);
  });

  /**
   * Failure scenario: missing required field (courseName)
   * Expect 400 with validation error payload.
   */
  it('returns 400 when a required field is missing', async () => {
    const invalidPayload = {
      semester: 2,
      shift: 'Morning',
      class: 'CS-101',
      date: '2026-01-04',
      type: 'theory',
      // courseName omitted intentionally
      courseCode: 'CS101',
      timeFrom: '09:00',
      timeTo: '10:30',
    };

    const res = await request(app)
      .post('/api/v1/sessions')
      .set('Accept', 'application/json')
      .send(invalidPayload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  /**
   * Failure scenario: invalid date format
   */
  it('returns 400 for invalid date format', async () => {
    const payload = {
      semester: 2,
      shift: 'Morning',
      class: 'CS-101',
      date: 'not-a-date',
      type: 'theory',
      courseName: 'Intro to Testing',
      courseCode: 'CS101',
      timeFrom: '09:00',
      timeTo: '10:30',
    };

    const res = await request(app)
      .post('/api/v1/sessions')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  /**
   * Failure scenario: invalid semester value (non-numeric)
   */
  it('returns 400 for invalid semester value', async () => {
    const payload = {
      semester: 'second', // invalid
      shift: 'Morning',
      class: 'CS-101',
      date: '2026-01-04',
      type: 'theory',
      courseName: 'Intro to Testing',
      courseCode: 'CS101',
      timeFrom: '09:00',
      timeTo: '10:30',
    };

    const res = await request(app)
      .post('/api/v1/sessions')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
