/**
 * Simple API integration layer for AttendRevolution frontend.
 *
 * This file centralizes endpoint constants and provides helper
 * functions that wrap `fetch`. Currently `ENABLE_API` is false
 * so these helpers return simulated responses — flip the flag
 * to call the real backend later.
 */

const ENABLE_API = false; // Feature flag: set true to enable real network calls

const BASE = ""; // Base path for API (empty = same origin). Change if needed.

export const ENDPOINTS = {
  CREATE_SESSION: `${BASE}/api/v1/sessions`,
  SUBMIT_ATTENDANCE: `${BASE}/api/v1/attendance`,
  SESSION_QR: (id: string) => `${BASE}/api/v1/sessions/${id}/qrcode`,
  SESSION_REPORT: (id: string) => `${BASE}/api/v1/sessions/${id}/report`,
};

async function delay<T>(ms = 300, value?: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value as T), ms));
}

export type ApiResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status?: string; message?: string; errors?: Record<string, string> };

export async function createSession(payload: Record<string, unknown>): Promise<ApiResult<{ id: string }>> {
  const p = payload as Record<string, unknown>;
  if (!ENABLE_API) {
    // Simulate validation error when courseName === 'SIMULATE_VALIDATION'
    const courseName = p["courseName"];
    if (typeof courseName === "string" && courseName === "SIMULATE_VALIDATION") {
      return delay(300, {
        ok: false,
        status: "validation",
        message: "Validation failed",
        errors: { courseName: "Course name is invalid (simulated)" },
      });
    }

    // Simulate server error
    if (typeof courseName === "string" && courseName === "SIMULATE_SERVER_ERROR") {
      return delay(300, { ok: false, status: "server", message: "Internal server error (simulated)" });
    }

    const fake = { id: `session-${Date.now()}` };
    return delay(400, { ok: true, data: fake });
  }

  const res = await fetch(ENDPOINTS.CREATE_SESSION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const json = await res.json().catch(() => null);
  return { ok: true, data: json };
}

export async function submitAttendance(payload: Record<string, unknown>): Promise<ApiResult> {
  const p = payload as Record<string, unknown>;
  if (!ENABLE_API) {
    // Simulate QR expired when qrToken contains EXPIRED
    const qrToken = p["qrToken"];
    if (typeof qrToken === "string" && qrToken.includes("EXPIRED")) {
      return delay(200, { ok: false, status: "qr_expired", message: "QR token has expired" });
    }

    // Simulate validation when rollNumber is 'INVALID'
    const rollNumber = p["rollNumber"];
    if (typeof rollNumber === "string" && rollNumber === "INVALID") {
      return delay(200, { ok: false, status: "validation", message: "Invalid roll number", errors: { rollNumber: "Roll number not found" } });
    }

    return delay(300, { ok: true, data: { received: true } });
  }

  const res = await fetch(ENDPOINTS.SUBMIT_ATTENDANCE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const json = await res.json().catch(() => null);
  return { ok: true, data: json };
}

export async function fetchQr(sessionId: string): Promise<ApiResult<string | { qrToken?: string }>> {
  if (!ENABLE_API) {
    // Simulate session expired if sessionId contains 'expired'
    if (sessionId.includes("expired")) {
      return delay(150, { ok: false, status: "session_expired", message: "Session has expired" });
    }

    // return a simple token-like string for demo
    return delay(200, { ok: true, data: `QR-DEMO-${sessionId}` });
  }

  const res = await fetch(ENDPOINTS.SESSION_QR(sessionId), { method: 'GET' });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = await res.json().catch(() => null);
    return { ok: true, data: j };
  }
  const text = await res.text().catch(() => '');
  return { ok: true, data: text };
}

export async function fetchReport(sessionId: string, format: 'csv' | 'pdf' = 'csv') {
  if (!ENABLE_API) {
    // Return a CSV blob for demo
    const csv = `Roll No,Marked At\n1,${new Date().toISOString()}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    return delay(200, { ok: true, data: blob });
  }

  const url = `${ENDPOINTS.SESSION_REPORT(sessionId)}?format=${encodeURIComponent(format)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const blob = await res.blob();
  return { ok: true, data: blob };
}

export default {
  ENDPOINTS,
  createSession,
  submitAttendance,
  fetchQr,
  fetchReport,
};
