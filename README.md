# AttendRevolution — Backend (API-first)

This repository contains the AttendRevolution backend: a RESTful, API-first service for QR-based attendance tracking.

> Note: This README documents the backend only. The frontend/UI is intentionally UI-agnostic and is implemented separately.

---

## Overview (backend-only)

AttendRevolution is a production-ready backend service that provides:
- Teacher-managed attendance sessions with server-generated session QR tokens
-- Student attendance marking using scanned `Session QR` + `rollNumber`
-- Device-based attendance protection (prevents one device from marking for multiple students)
- Teacher-only reporting (CSV / PDF) and export

This service is API-first and UI-agnostic: any frontend or mobile client that follows the API can be used.

---

## Features

- Teacher creates sessions and receives a `sessionId` and `qrToken` (Session QR)
- Students mark attendance by POSTing `rollNumber` + `qrToken` to the attendance endpoint (no login)
- Device-based protection via `deviceHash = sha256(User-Agent | IP | sessionId)` (one device per session)
- Duplicate prevention by `sessionId + rollNumber` (unique index)
-- Teacher-only endpoints protected by `teacherAuth` middleware using Teacher ID (`teacher-id` header)
- Reports: CSV and PDF, with optional date-range filtering

---

## System Flow (summary)

- Teacher-only: create session → backend generates `qrToken` and `sessionId`.
- Students scan the displayed Session QR, submit their `rollNumber` and scanned `qrToken` to the backend.
- Backend validates:
    - Session exists and is active
    - `qrToken` matches session
    - Request is within session time window
    - `rollNumber` hasn't been submitted for the session
    - Device hasn't already submitted for that same session (via `deviceHash`)
- Teacher can fetch and export session attendance (CSV/PDF).

---

## Tech Stack (backend)

- Node.js 18+
- Express.js
- MongoDB (Mongoose)
- Testing: Jest + Supertest
- CSV: `csv-writer`
- PDF: `pdfkit`
- QR generation: `qrcode`

Security and auth notes:
- Teacher authentication is middleware based and uses a `teacher-id` header (no student login is required for attendance marking).
- There is no student JWT/login flow in this backend.

---

## Environment & Setup (backend)

Prerequisites: Node.js 18+, npm, MongoDB.

Quick steps:

```powershell
# From repository root
npm install
# Create .env with at least:
# MONGODB_URI=mongodb://localhost:27017/attendrevolution
# (Other env vars may be used by the server)

npm start
```

API base: `http://localhost:3000/api/v1`

See `docs/API.md` for full endpoint details.

---

## How the backend works with the frontend (UI-agnostic)

-- Teacher UI calls `POST /api/v1/sessions` (authenticated by Teacher ID `teacher-id`) to create a session.
- Backend returns `{ sessionId, qrToken }`.
- Teacher UI renders a QR (Session QR) based on `qrToken` and `sessionId`.
- Student opens a browser, scans the QR, enters `rollNumber` and the UI submits `rollNumber` + `qrToken` to `POST /api/v1/attendance/session/:sessionId/mark`.
- Backend derives device identity from `User-Agent` and client IP (or `X-Forwarded-For`) and enforces the device-based restriction.
- Teacher can query and export attendance via teacher-only endpoints.

---

## Documentation

- API reference: `docs/API.md`
- Architecture diagrams and flows: `ARCHITECTURE.md`, `FLOWCHARTS.md`
- Project status: `docs/PROJECT_STATUS.md`

---

## Project status

- Backend: COMPLETE (API implemented, tests passing)
- Frontend/UI: Manual / Separate implementation (consume the public API endpoints)

---

If you need an OpenAPI spec or Postman collection generated from `docs/API.md`, I can produce that next.

