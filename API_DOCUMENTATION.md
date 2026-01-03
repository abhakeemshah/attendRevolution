# AttendRevolution API Documentation

This document provides a detailed overview of the AttendRevolution API. All endpoints are versioned and prefixed with `/api/v1`.

## Authentication

### `POST /api/v1/auth/register`

Registers a new user. By default, new users are not approved and cannot log in until an administrator approves them.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student"
}
```

- `name` (string, required): The user's full name.
- `email` (string, required): The user's email address. Must be unique.
- `password` (string, required): The user's password. Must be at least 8 characters long.
- `role` (string, optional): The user's role. Can be either `student` or `teacher`. Defaults to `student`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please wait for admin approval.",
  "data": {
    "userId": "60d0fe4f5311236168a109ca"
  }
}
```

### `POST /api/v1/auth/login`

Authenticates a user and returns a JWT.

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d0fe4f5311236168a109cb",
      "name": "Jane Smith",
      "email": "teacher@example.com",
      "role": "teacher"
    }
  }
}
```

---

## Sessions

### `POST /api/v1/session`

Creates a new attendance session. (Teacher only)

**Request Body:**
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "duration": 60
}
```

- `courseCode` (string, required): The code for the course.
- `courseName` (string, required): The name of the course.
- `duration` (number, required): The duration of the session in minutes.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Session created successfully.",
  "data": {
    "session": { ... },
    "qrCode": "data:image/png;base64,..."
  }
}
```

### `GET /api/v1/session/:id`

Retrieves a session by its ID. (Teacher or Student)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": { ... }
  }
}
```

### `PUT /api/v1/session/:id/end`

Ends an attendance session. (Teacher only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session ended successfully.",
  "data": {
    "session": { ... }
  }
}
```

---

## Attendance

### `POST /api/v1/attendance/session/:sessionId/mark`

Marks a student's attendance for a session. (Student only)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Attendance marked successfully.",
  "data": {
    "attendanceRecord": { ... }
  }
}
```

### `GET /api/v1/attendance/session/:sessionId`

Retrieves all attendance records for a session. (Teacher only)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attendance": [ ... ]
  }
}
```

---

## Reports

### `GET /api/v1/reports/session/:sessionId/:format`

Generates and downloads an attendance report for a session. (Teacher only)

- `format` can be either `csv` or `pdf`.

**Response:**
The response will be a file download with the appropriate content type.
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="session_..."
```
or
```
Content-Type: text/csv
Content-Disposition: attachment; filename="session_..."
```