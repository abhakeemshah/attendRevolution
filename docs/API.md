# API Documentation

This document describes the backend API endpoints for Attend Revolution.
Keep this file concise and copy-paste friendly for UI or external docs.

---

## Base prefix

All endpoints are prefixed with `/api/v1`.

---

## 1) Create Session

- Endpoint
  - POST /api/v1/sessions
  - (Implementation also accepts `/api/v1/session` for backwards compatibility)

- Description
  - Teacher creates an attendance session (date, time, course, etc.). Server returns a unique `sessionId` and a `qrToken` used to generate the QR code.

- Auth
  - Teacher-only (protected by teacher authentication middleware)

- Request body (JSON)
  ```json
  {
    "semester": 2,
    "shift": "Morning",
    "class": "CS-101",
    "date": "2026-01-04",
    "type": "theory",
    "courseName": "Intro to Testing",
    "courseCode": "CS101",
    "timeFrom": "09:00",
    "timeTo": "10:30",
    "group": "A" // optional
  }
  ```

- Success response (201)
  ```json
  {
    "success": true,
    "message": "Session created successfully.",
    "data": {
      "sessionId": "605c9b...",
      "qrToken": "a1b2c3..."
    }
  }
  ```

- Error responses
  - 400 VALIDATION_ERROR — invalid/missing fields
  - 401 Unauthorized — missing Teacher ID (`teacher-id` header)
  - 403 Forbidden — invalid teacher
  - 500 INTERNAL_ERROR — unexpected server error

---

## 2) Mark Attendance (student)

- Endpoint
  - POST /api/v1/attendance/session/:sessionId/mark

- Description
  - Public endpoint. Students scan the Session QR and submit their `rollNumber` and the scanned `qrToken` (Session QR token). The server validates the Session QR, session activity window, prevents duplicates (by roll number), and enforces device-based attendance protection.

- Auth
  - Public (no login required)

- Path params
  - `sessionId` — Session identifier returned by session creation

- Request body (JSON)
  ```json
  {
    "rollNumber": "2024CS101",
    "qrToken": "X7f9K2qL"  # Session QR token
  }
  ```

- Important request headers (used to identify device, no frontend changes required)
  - `User-Agent` (browser/device identifier)
  - `X-Forwarded-For` or client IP (server falls back to `req.ip`)

- Success response (201)
  ```json
  {
    "success": true,
    "message": "Attendance marked successfully",
    "data": {
      "attendanceRecord": {
        "sessionId": "605c9b...",
        "rollNumber": "2024CS101",
        "scannedAt": "2026-01-04T09:15:00.000Z",
        "deviceHash": "<sha256-hash>"
      }
    }
  }
  ```

- Error responses
  - 400 VALIDATION_ERROR — missing/invalid `rollNumber` or `qrToken` (Session QR), or duplicate rollNumber
    ```json
    {
      "success": false,
      "error": { "code": "VALIDATION_ERROR", "message": "Invalid or missing rollNumber." }
    }
    ```
  - 400 VALIDATION_ERROR — invalid Session QR token
  - 403 Forbidden — attendance already submitted from this device
    ```json
    {
      "success": false,
      "error": { "message": "Attendance already submitted from this device" }
    }
    ```
  - 404 Not Found — session not found
  - 500 INTERNAL_ERROR — unexpected server error

- HTTP status codes used
  - 201 Created — success
  - 400 Bad Request — validation issues (includes duplicate roll number)
  - 403 Forbidden — device-based attendance protection triggered
  - 404 Not Found — session missing

---

## 3) Get Attendance for a Session (teacher)

- Endpoint
  - GET /api/v1/attendance/session/:sessionId

- Description
  - Teacher-only endpoint to fetch attendance records for the session (roll numbers and timestamps).

- Auth
  - Teacher-only (`teacherAuth` middleware)

- Path params
  - `sessionId` — Session identifier

- Success response (200)
  ```json
  {
    "success": true,
    "data": {
      "attendance": [
        { "rollNumber": "2024CS101", "scannedAt": "2026-01-04T09:15:00.000Z" },
        { "rollNumber": "2024CS102", "scannedAt": "2026-01-04T09:16:00.000Z" }
      ]
    }
  }
  ```

- Error responses
  - 403 Forbidden — not a verified teacher
  - 404 Not Found — session missing
  - 500 INTERNAL_ERROR — unexpected server error

- HTTP status codes used: 200, 403, 404, 500

---

## 4) Generate / Download Report (CSV)

- Endpoint (implemented)
  - GET /api/v1/reports/session/:sessionId/csv

- Note: code mounts report route under `/api/v1/reports/session/:sessionId/:format`.

- Description
  - Teacher-only: builds a CSV of attendance (rollNumber, scannedAt). Supports optional date range filtering via query params.

- Auth
  - Teacher-only (`teacherAuth` middleware)

- Path params
  - `sessionId` — Session identifier

- Query params (optional)
  - `startDate` (ISO 8601) — include records scanned at/after this date
  - `endDate` (ISO 8601) — include records scanned at/before this date

- Success response
  - Returns a CSV file download (`Content-Disposition: attachment; filename=...`) containing rows with `RollNumber,ScannedAt`.

- Error responses
  - 403 Forbidden — not a teacher
  - 404 Not Found — session not found
  - 400 Bad Request — invalid date format
  - 500 INTERNAL_ERROR — file generation error

- HTTP status codes used: 200 (file download), 403, 404, 400, 500

---

## 5) Generate / Download Report (PDF)

- Endpoint (implemented)
  - GET /api/v1/reports/session/:sessionId/pdf

- Description
  - Teacher-only: builds a compact PDF report listing roll numbers and timestamps. Supports optional `startDate`/`endDate` filters.

- Auth
  - Teacher-only (`teacherAuth` middleware)

- Success response
  - Returns a PDF file download

- Error responses: same as CSV

- HTTP status codes used: 200 (file download), 403, 404, 400, 500

---

## Implementation details (explanations)

### Device-based attendance protection
- Goal: Prevent one present student from marking attendance for multiple people from the same device/browser.
- Mechanism: server computes `deviceHash = sha256(User-Agent | IP | sessionId)` when a mark request arrives.
  - `User-Agent` is read from `req.headers['user-agent']`.
  - IP is taken from `X-Forwarded-For` when present, otherwise `req.ip`.
  - `sessionId` is included so the same device can be re-used across different sessions but only once per session.
- Enforcement: Attendance records store `deviceHash`. The service checks for existing records with the same `{ sessionId, deviceHash }` before storing a new one. If found, the request is rejected with 403 and message "Attendance already submitted from this device".
- No frontend change is required — device info is derived from standard headers.

### Duplicate prevention logic
- Duplicate by student: compound unique index on `(sessionId, rollNumber)` prevents a roll number from being marked multiple times for the same session. Attempting to mark again results in a validation-style error (400 with `VALIDATION_ERROR`).
- Duplicate by device: compound unique index on `(sessionId, deviceHash)` and explicit pre-checks in service prevent a device from submitting multiple attendance records for the same session. This returns 403.

### QR expiry / session time-window logic
- QR token validity is tied to the `Session` record and an active window:
  - Session must have `isActive === true`.
  - Current time must be between `session.date + timeFrom` and `session.date + timeTo` (server-side check).
- If the QR token does not match the session's `qrToken`, the request is rejected (400 `VALIDATION_ERROR`).
- If the session is not active or outside the time window, the request is rejected (400) with appropriate message.

---

## Error format
All API errors follow the JSON shape below (via global error handler):
```json
{
  "success": false,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable message"
  }
}
```

- Common `code` values: `VALIDATION_ERROR`, `INTERNAL_ERROR` (others may appear depending on error)

---

## Quick examples

- Mark attendance (curl)
```bash
curl -X POST https://api.example.com/api/v1/attendance/session/<SESSION_ID>/mark \
  -H "Content-Type: application/json" \
  -H "User-Agent: ExampleBrowser/1.0" \
  -H "X-Forwarded-For: 203.0.113.5" \
  -d '{"rollNumber":"2024CS101","qrToken":"abc123"}'
```

- Download CSV (teacher, example)
```bash
curl -L -H "teacher-id: T-ABC-123" \
  "https://api.example.com/api/v1/reports/session/<SESSION_ID>/csv?startDate=2026-01-01&endDate=2026-01-31" --output report.csv
```

---

If you want, I can:
- Add sample Postman collection or OpenAPI spec from this doc.
- Add streaming responses for large CSV/PDF (server-side optimization).

