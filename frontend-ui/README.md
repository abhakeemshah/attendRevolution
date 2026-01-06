# AttendRevolution Frontend

This frontend is prepared for local development and integration with the AttendRevolution backend.

Developer: Abdul Hakeem Shah

Quick start:

```sh
git clone <YOUR_GIT_URL>
cd frontend-ui
npm install
npm run dev
```

Notes:
- This frontend has been cleaned to include only the Teacher and Student panels.

Mock API Mode (ENABLE_API = false)
---------------------------------

The frontend includes a lightweight, feature-flagged API helper at `src/lib/api.ts`.
By default the helper runs in "mock" mode. That means `ENABLE_API` is `false` and
all API functions return simulated responses so you can exercise UI flows without a
backend running. Flip `ENABLE_API` to `true` in `src/lib/api.ts` to enable real
network calls to the backend later.

Simulated cases (how to trigger them)
- `createSession` (POST `/api/v1/sessions`):
	- Set `courseName` to `SIMULATE_VALIDATION` to get a simulated validation error
		with a per-field `errors` object (useful to verify `fieldErrors` display).
	- Set `courseName` to `SIMULATE_SERVER_ERROR` to simulate a server-side error
		(general `submitError` path).
	- Any other `courseName` returns a successful response with a fake `id`.

- `submitAttendance` (POST `/api/v1/attendance`):
	- Set `rollNumber` to `INVALID` to simulate a validation failure for the roll
		number (response includes `errors.rollNumber`).
	- Use a `qrToken` string containing `EXPIRED` to simulate an expired QR token
		(response `status` = `qr_expired`, useful to show QR/session error UI).
	- Any other payload returns success.

- `fetchQr` (GET `/api/v1/sessions/:id/qrcode`):
	- Use a `sessionId` that contains the substring `expired` to simulate a
		`session_expired` response (useful to test session/QR error rendering).
	- Otherwise you get a demo QR token string.

- `fetchReport` (GET `/api/v1/sessions/:id/report?format=csv|pdf`):
	- In mock mode returns a small CSV `Blob` so the download flow can be tested
		without the backend.

How this helps testing
- UI loading state: all mock helpers include small artificial delays so loading
	indicators and spinner states are exercised.
- Success flows: mocked `createSession`, `submitAttendance`, and `fetchReport`
	return realistic success payloads for navigation and download testing.
- Validation flows: `createSession` and `submitAttendance` can return structured
	validation `errors` to verify per-field error messages are rendered correctly.
- Error flows: server and QR/session-expired errors are simulated so the
	top-level `submitError`, `apiError`, and `qrError` UI states can be exercised.

Notes
- No additional dependencies are required to use mock mode.
- The mock behavior is intentionally centralized inside `src/lib/api.ts`, so
	switching to an actual backend is one-line change: set `ENABLE_API = true`.

Manual UI Verification Checklist
--------------------------------
Quick steps a reviewer can perform in the browser ( < 5 minutes ) to verify
mocked UI behavior without a backend.

- Create Session
	- Enter `Course Name` = `SIMULATE_VALIDATION` → Submit → expect per-field
		validation message for `courseName` and form shows validation state.
	- Enter `Course Name` = `SIMULATE_SERVER_ERROR` → Submit → expect a
		top-level server error banner (`submitError`) describing failure.
	- Enter normal values (any other course name) → Submit → expect success
		state and navigation to the live session screen with a fake session id.

- Student Scan
	- Set `Roll Number` = `INVALID` and perform a simulated scan → expect a
		validation error for the roll number (visible in the UI).
	- Use a QR token that contains `EXPIRED` (simulated via the scan flow) →
		expect a QR-expired message (`apiError`) and guidance to the student.
	- Normal input (regular roll number and QR token) → expect success state
		and the attendance confirmation UI.

- Session Live
	- Navigate to a session whose ID contains `expired` → expect a
		session-expired message in the QR area (`qrError`).
	- Navigate to a normal session → expect the QR placeholder or demo token
		displayed and the timer UI to operate (mock delays exercise loading states).
	- Click `Download Report` → expect a mock CSV file to be downloaded by the
		browser (mocked `fetchReport` returns a CSV `Blob`).

Notes
- These checks exercise loading, success, validation, and error UI states.
- All behavior is controlled from `src/lib/api.ts` by the `ENABLE_API` flag;
	leave it `false` for mock mode and flip to `true` when you have a running
	backend to perform real integration tests.

- Replace placeholder images and endpoint URLs before deploying.
