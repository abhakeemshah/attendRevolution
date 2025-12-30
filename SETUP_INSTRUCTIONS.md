# Quick Setup Instructions

## Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Verify Data Files**
   Ensure these files exist (they should be created automatically):
   - `server/data/sessions.json` (should contain `[]`)
   - `server/data/attendance.json` (should contain `[]`)

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Teacher Interface: http://localhost:3000/teacher
   - Student Interface: http://localhost:3000/student
   - API Endpoint: http://localhost:3000/api

## Testing the API

### Start a Session
```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"class":"CS-101","subject":"Data Structures","section":"A","duration":5}'
```

### Mark Attendance
```bash
curl -X POST http://localhost:3000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<session-id-from-above>","rollNo":12345}'
```

## Troubleshooting

- **Port already in use**: Change PORT in `.env` or kill the process using port 3000
- **Module not found**: Run `npm install` again
- **Data files missing**: Create `server/data/` directory and initialize JSON files with `[]`

