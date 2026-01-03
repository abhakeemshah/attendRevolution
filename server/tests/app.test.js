// server/tests/app.test.js

const request = require('supertest');
const app = require('../app');

describe('API Health Check', () => {
  it('should return 200 OK and a success message', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Server is running');
  });
});
