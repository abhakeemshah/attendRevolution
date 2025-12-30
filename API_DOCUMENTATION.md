# 🔌 API Documentation
## QR-Based Proxy-Free Attendance System

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**API Version:** v1  
**Last Updated:** 2026

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## 1. API Overview

### 1.1 API Style

**Type:** RESTful API  
**Protocol:** HTTP/HTTPS  
**Data Format:** JSON  
**Method:** Stateless

### 1.2 Base Information

- **Base URL:** `http://localhost:3000/api` (Development)
- **Production URL:** `https://api.attendance-system.edu/api` (Future)
- **Content-Type:** `application/json`
- **Character Encoding:** UTF-8

### 1.3 HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resources | Yes |
| POST | Create resources | No |
| PUT | Update resources | Yes |
| DELETE | Delete resources | Yes |

---

## 2. Authentication

### 2.1 Current Status (MVP)

**Authentication:** None (MVP Phase)

The MVP does not include authentication. Future versions will implement:
- JWT token-based authentication
- Role-based access control (Teacher/Student/Admin)
- Session management

### 2.2 Future Authentication

```http
Authorization: Bearer <jwt_token>
```

---

## 3. Endpoints

### 3.1 Session Management Endpoints

#### 3.1.1 Start Attendance Session

**Endpoint:** `POST /api/session/start`

**Description:** Creates a new attendance session and generates a QR code.

**Request:**

```http
POST /api/session/start
Content-Type: application/json

{
  "class": "CS-101",
  "subject": "Data Structures",
  "section": "A",
  "duration": 5
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| class | string | Yes | Class identifier | 1-50 characters |
| subject | string | Yes | Subject name | 1-100 characters |
| section | string | Yes | Section identifier | 1-10 characters |
| duration | number | Yes | Session duration in minutes | 3-10 minutes |

**Response:**

**Success (201 Created):**

```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "class": "CS-101",
    "subject": "Data Structures",
    "section": "A",
    "duration": 5,
    "startTime": "2026-01-15T10:00:00Z",
    "endTime": "2026-01-15T10:05:00Z",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrData": "sessionId=550e8400-e29b-41d4-a716-446655440000&expiry=1705313100",
    "isActive": true
  }
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "duration",
        "message": "Duration must be between 3 and 10 minutes"
      }
    ]
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | Session created successfully |
| 400 | Invalid request parameters |
| 500 | Internal server error |

---

#### 3.1.2 Get Session Details

**Endpoint:** `GET /api/session/:sessionId`

**Description:** Retrieves details of an existing session.

**Request:**

```http
GET /api/session/550e8400-e29b-41d4-a716-446655440000
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Session identifier |

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "class": "CS-101",
    "subject": "Data Structures",
    "section": "A",
    "duration": 5,
    "startTime": "2026-01-15T10:00:00Z",
    "endTime": "2026-01-15T10:05:00Z",
    "isActive": true,
    "attendanceCount": 45,
    "timeRemaining": 120
  }
}
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Session retrieved successfully |
| 404 | Session not found |
| 500 | Internal server error |

---

#### 3.1.3 End Attendance Session

**Endpoint:** `POST /api/session/end`

**Description:** Ends an active attendance session.

**Request:**

```http
POST /api/session/end
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Session identifier |

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "message": "Session ended successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": false,
    "totalAttendance": 142,
    "endTime": "2026-01-15T10:04:30Z"
  }
}
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

**Error (403 Forbidden):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_ALREADY_ENDED",
    "message": "Session is already inactive"
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Session ended successfully |
| 403 | Session already ended |
| 404 | Session not found |
| 500 | Internal server error |

---

#### 3.1.4 List Active Sessions

**Endpoint:** `GET /api/session/active`

**Description:** Retrieves all currently active sessions.

**Request:**

```http
GET /api/session/active
```

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "class": "CS-101",
        "subject": "Data Structures",
        "section": "A",
        "startTime": "2026-01-15T10:00:00Z",
        "endTime": "2026-01-15T10:05:00Z",
        "attendanceCount": 45,
        "timeRemaining": 120
      }
    ],
    "total": 1
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Active sessions retrieved successfully |
| 500 | Internal server error |

---

### 3.2 Attendance Endpoints

#### 3.2.1 Mark Attendance

**Endpoint:** `POST /api/attendance/mark`

**Description:** Records student attendance for a session.

**Request:**

```http
POST /api/attendance/mark
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "rollNo": 12345
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| sessionId | string (UUID) | Yes | Session identifier | Valid UUID |
| rollNo | number | Yes | Student roll number | 1-999999 |

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "rollNo": 12345,
    "timestamp": "2026-01-15T10:02:30Z",
    "status": "present"
  }
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid roll number format"
  }
}
```

**Error (403 Forbidden):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Attendance session has expired"
  }
}
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

**Error (409 Conflict):**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Attendance already recorded for this roll number"
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Attendance marked successfully |
| 400 | Invalid request parameters |
| 403 | Session inactive or expired |
| 404 | Session not found |
| 409 | Duplicate attendance entry |
| 500 | Internal server error |

---

#### 3.2.2 Get Attendance for Session

**Endpoint:** `GET /api/attendance/session/:sessionId`

**Description:** Retrieves all attendance records for a specific session.

**Request:**

```http
GET /api/attendance/session/550e8400-e29b-41d4-a716-446655440000
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Session identifier |

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| format | string | No | Response format (json/csv) | json |

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "class": "CS-101",
    "subject": "Data Structures",
    "section": "A",
    "date": "2026-01-15",
    "totalAttendance": 142,
    "attendance": [
      {
        "rollNo": 12345,
        "timestamp": "2026-01-15T10:00:15Z",
        "status": "present"
      },
      {
        "rollNo": 12346,
        "timestamp": "2026-01-15T10:00:22Z",
        "status": "present"
      }
    ]
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Attendance records retrieved successfully |
| 404 | Session not found |
| 500 | Internal server error |

---

#### 3.2.3 Check Attendance Status

**Endpoint:** `GET /api/attendance/check`

**Description:** Checks if a roll number has already marked attendance for a session.

**Request:**

```http
GET /api/attendance/check?sessionId=550e8400-e29b-41d4-a716-446655440000&rollNo=12345
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Session identifier |
| rollNo | number | Yes | Student roll number |

**Response:**

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "rollNo": 12345,
    "hasMarked": true,
    "timestamp": "2026-01-15T10:00:15Z"
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Status checked successfully |
| 400 | Invalid parameters |
| 404 | Session not found |
| 500 | Internal server error |

---

### 3.3 Report Endpoints

#### 3.3.1 Generate Attendance Report

**Endpoint:** `GET /api/session/:sessionId/report`

**Description:** Generates and downloads attendance report in specified format.

**Request:**

```http
GET /api/session/550e8400-e29b-41d4-a716-446655440000/report?format=csv
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string (UUID) | Yes | Session identifier |

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| format | string | No | Report format (csv/pdf) | csv |

**Response:**

**Success (200 OK):**

**CSV Format:**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="attendance_report_2026-01-15.csv"

Class,Subject,Section,Date,Total Attendance
CS-101,Data Structures,A,2026-01-15,142
Roll Number,Timestamp,Status
12345,2026-01-15T10:00:15Z,present
12346,2026-01-15T10:00:22Z,present
...
```

**PDF Format:**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="attendance_report_2026-01-15.pdf"

[PDF Binary Data]
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Report generated successfully |
| 404 | Session not found |
| 500 | Internal server error |

---

## 4. Request/Response Formats

### 4.1 Request Format

All requests must include:

```http
Content-Type: application/json
```

**Example:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "rollNo": 12345
}
```

### 4.2 Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      // Additional error details (optional)
    ]
  }
}
```

### 4.3 Date/Time Format

All timestamps use **ISO 8601** format:
```
YYYY-MM-DDTHH:mm:ssZ
```

**Example:** `2026-01-15T10:00:00Z`

---

## 5. Error Handling

### 5.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| SESSION_NOT_FOUND | 404 | Session does not exist |
| SESSION_EXPIRED | 403 | Session has expired |
| SESSION_INACTIVE | 403 | Session is not active |
| SESSION_ALREADY_ENDED | 403 | Session already ended |
| DUPLICATE_ENTRY | 409 | Attendance already recorded |
| INVALID_ROLL_NUMBER | 400 | Roll number out of range |
| INTERNAL_ERROR | 500 | Internal server error |

### 5.2 Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### 5.3 Common Error Scenarios

#### Invalid Input
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "duration",
        "message": "Duration must be between 3 and 10 minutes"
      }
    ]
  }
}
```

#### Session Not Found
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  }
}
```

#### Duplicate Entry
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Attendance already recorded for this roll number"
  }
}
```

---

## 6. Rate Limiting

### 6.1 Current Status (MVP)

**Rate Limiting:** Not implemented in MVP

### 6.2 Future Implementation

- **Attendance submissions:** 10 requests per minute per IP
- **Session creation:** 5 requests per minute per IP
- **Report generation:** 3 requests per minute per IP

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642248000
```

---

## 7. Examples

### 7.1 Complete Flow Example

#### Step 1: Create Session

```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "class": "CS-101",
    "subject": "Data Structures",
    "section": "A",
    "duration": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### Step 2: Mark Attendance

```bash
curl -X POST http://localhost:3000/api/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "rollNo": 12345
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully"
}
```

#### Step 3: End Session

```bash
curl -X POST http://localhost:3000/api/session/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

#### Step 4: Download Report

```bash
curl -X GET "http://localhost:3000/api/session/550e8400-e29b-41d4-a716-446655440000/report?format=csv" \
  -o attendance_report.csv
```

### 7.2 JavaScript Examples

#### Start Session

```javascript
async function startSession(class, subject, section, duration) {
  const response = await fetch('http://localhost:3000/api/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      class,
      subject,
      section,
      duration
    })
  });
  
  const data = await response.json();
  return data;
}
```

#### Mark Attendance

```javascript
async function markAttendance(sessionId, rollNo) {
  const response = await fetch('http://localhost:3000/api/attendance/mark', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      rollNo
    })
  });
  
  const data = await response.json();
  return data;
}
```

#### Get Session Details

```javascript
async function getSession(sessionId) {
  const response = await fetch(`http://localhost:3000/api/session/${sessionId}`);
  const data = await response.json();
  return data;
}
```

### 7.3 Python Examples

#### Start Session

```python
import requests

def start_session(class_name, subject, section, duration):
    url = 'http://localhost:3000/api/session/start'
    payload = {
        'class': class_name,
        'subject': subject,
        'section': section,
        'duration': duration
    }
    response = requests.post(url, json=payload)
    return response.json()
```

#### Mark Attendance

```python
def mark_attendance(session_id, roll_no):
    url = 'http://localhost:3000/api/attendance/mark'
    payload = {
        'sessionId': session_id,
        'rollNo': roll_no
    }
    response = requests.post(url, json=payload)
    return response.json()
```

---

## 8. API Versioning

### 8.1 Current Version

**Version:** v1  
**Base Path:** `/api`

### 8.2 Future Versions

Future API versions will be accessed via:
```
/api/v2/...
```

---

## 9. Testing

### 9.1 Postman Collection

A Postman collection is available for testing all endpoints.

**Import URL:** (To be provided)

### 9.2 Test Data

**Test Session:**
```json
{
  "class": "TEST-101",
  "subject": "Test Subject",
  "section": "A",
  "duration": 5
}
```

**Test Roll Numbers:** 10001-10150

---

## 10. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026 | Initial API documentation |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026 | Abdul Hakeem Shah | Initial API documentation |

---

**Document Status:** ✅ Approved  
**Review Date:** Monthly  
**Distribution:** Development Team, API Consumers

