// server/tests/attendance.test.js

// Mock the attendance service to isolate controller and route behavior.
// The mock enforces device-based submission rules by computing the same
// deviceHash that the real service uses (sha256 of userAgent|ip|sessionId).
const mockAttendanceRecord = { _id: 'att-123', rollNumber: '2024CS101', sessionId: 'sess-1' };

// Keep track of device submissions per session in-memory for the mock.
const seenDeviceHashes = new Map();

jest.mock('../services/attendance.service', () => {
  // Local store of device hashes per session for the mock implementation.
  const seenDeviceHashes = new Map();
  return {
    markAttendance: jest.fn(async (sessionId, rollNumber, qrToken, userAgent, ip) => {
      const crypto = require('crypto');
      // Validate QR token
      if (qrToken === 'BAD') {
        const err = new Error('Invalid QR token.');
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      // Compute deviceHash same as production code
      const ua = userAgent || '';
      const clientIp = ip || '';
      const deviceHash = crypto.createHash('sha256').update(`${ua}|${clientIp}|${sessionId}`).digest('hex');

      const set = seenDeviceHashes.get(sessionId) || new Set();
      // If device already used for this session, simulate 403
      if (set.has(deviceHash)) {
        const err = new Error('Attendance already submitted from this device');
        err.status = 403;
        throw err;
      }

      // Simulate rollNumber duplicate
      if (rollNumber === 'DUPLICATE') {
        const err = new Error('You have already marked your attendance for this session.');
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      // Otherwise record device usage and return a fake attendance record
      set.add(deviceHash);
      seenDeviceHashes.set(sessionId, set);
      return { ...mockAttendanceRecord, rollNumber, sessionId, deviceHash };
    }),
  };
});

const request = require('supertest');
const app = require('../app');

describe('Attendance Marking API', () => {
  /**
   * Success scenario: valid rollNumber and qrToken
   */
  it('marks attendance successfully with valid rollNumber and qrToken', async () => {
    const payload = { rollNumber: '2024CS101', qrToken: 'GOOD' };
    const res = await request(app)
      .post('/api/v1/attendance/session/sess-1/mark')
      .set('User-Agent', 'Device-A')
      .set('X-Forwarded-For', '1.1.1.1')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Attendance marked successfully');
    expect(res.body.data).toHaveProperty('attendanceRecord');
    expect(res.body.data.attendanceRecord).toHaveProperty('rollNumber', payload.rollNumber);
  });

  /**
   * Failure: missing rollNumber
   */
  it('returns 400 when rollNumber is missing', async () => {
    const payload = { qrToken: 'GOOD' };

    const res = await request(app)
      .post('/api/v1/attendance/session/sess-1/mark')
      .set('User-Agent', 'Device-Miss')
      .set('X-Forwarded-For', '9.9.9.9')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  /**
   * Failure: invalid QR token
   */
  it('returns 400 for invalid QR token', async () => {
    const payload = { rollNumber: '2024CS101', qrToken: 'BAD' };

    const res = await request(app)
      .post('/api/v1/attendance/session/sess-1/mark')
      .set('User-Agent', 'Device-B')
      .set('X-Forwarded-For', '2.2.2.2')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  /**
   * Failure: duplicate attendance
   */
  it('returns 400 for duplicate attendance attempts', async () => {
    // Use a different device to ensure device-based blocking does not
    // interfere with testing duplicate rollNumber behavior.
    const payload = { rollNumber: 'DUPLICATE', qrToken: 'GOOD' };

    const res = await request(app)
      .post('/api/v1/attendance/session/sess-1/mark')
      .set('User-Agent', 'Device-C')
      .set('X-Forwarded-For', '3.3.3.3')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  /**
   * Device rule: the same device cannot be used to mark attendance twice
   * in the same session, even for a different roll number.
   */
  it('rejects second submission from the same device', async () => {
    // First submission from Device-X should succeed
    const first = await request(app)
      .post('/api/v1/attendance/session/sess-2/mark')
      .set('User-Agent', 'Device-X')
      .set('X-Forwarded-For', '4.4.4.4')
      .send({ rollNumber: 'R1', qrToken: 'GOOD' })
      .expect(201);

    // Second submission from same device for same session with different roll
    const second = await request(app)
      .post('/api/v1/attendance/session/sess-2/mark')
      .set('User-Agent', 'Device-X')
      .set('X-Forwarded-For', '4.4.4.4')
      .send({ rollNumber: 'R2', qrToken: 'GOOD' })
      .expect(403);

    expect(second.body).toHaveProperty('success', false);
    expect(second.body).toHaveProperty('error');
    expect(second.body.error.message).toEqual('Attendance already submitted from this device');
  });
});
