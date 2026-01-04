# Flowcharts — AttendRevolution Backend

Updated to reflect the implemented backend flows: no student login, teacher-only session management, QR-based attendance, deviceHash enforcement, and report export.

---

## System Overview

```mermaid
flowchart TD
  Teacher[Teacher UI] -->|POST /api/v1/sessions| API[Backend API]
  Teacher -->|GET /api/v1/reports/...| API
  Student[Student Browser] -->|POST /api/v1/attendance/session/:sessionId/mark| API
  API -->|queries| MongoDB[(MongoDB)]
```

---

## Session Creation Flow

```mermaid
sequenceDiagram
  participant T as Teacher UI
  participant API as Server
  participant SS as Session Service
  participant DB as MongoDB

  T->>API: POST /api/v1/sessions {session data}\n(Teacher ID header required)
  API->>SS: createSession(params)
  SS->>DB: insert Session {qrToken, isActive, time window}
  DB-->>SS: saved
  SS-->>API: { sessionId, qrToken }
  API-->>T: 201 Created
```

---

## Attendance Marking Flow (student)

```mermaid
sequenceDiagram
  participant S as Student
  participant API as Attendance Controller
  participant AS as Attendance Service
  participant SS as Session Service
  participant DB as MongoDB

  S->>API: POST /api/v1/attendance/session/:sessionId/mark\n{ rollNumber, qrToken }\n(headers: User-Agent, X-Forwarded-For)
  API->>AS: markAttendance(sessionId, rollNumber, qrToken, userAgent, ip)
  AS->>SS: getSession(sessionId)
  SS-->>AS: session
  AS->>AS: compute deviceHash = sha256(userAgent | ip | sessionId)
  AS->>DB: find Attendance {sessionId, deviceHash}
  DB-->>AS: if exists -> reject 403
  AS->>DB: find Attendance {sessionId, rollNumber}
  DB-->>AS: if exists -> reject 400 (VALIDATION_ERROR)
  AS->>DB: insert Attendance {rollNumber, sessionId, scannedAt, deviceHash}
  DB-->>AS: saved
  AS-->>API: 201 Created
  API-->>S: success message
```

---

## Device Protection & Duplicate Prevention

- Device-based attendance protection: device hash prevents multiple submissions from the same device for a session.
- Roll-number uniqueness prevents the same student being marked more than once.

---

## Report Export Flow

```mermaid
sequenceDiagram
  participant T as Teacher
  participant API as Report Controller
  participant RS as Report Service
  participant DB as MongoDB

  T->>API: GET /api/v1/reports/session/:sessionId/csv (or /pdf)\n(Teacher ID header required)
  API->>RS: generateReport(sessionId, format, startDate?, endDate?)
  RS->>DB: Attendance.find({ sessionId, scannedAt: { $gte, $lte } }).select('rollNumber scannedAt')
  DB-->>RS: rows
  RS->>RS: format CSV or PDF
  RS-->>API: file path / stream
  API-->>T: file download
```

---

This file reflects the current behavior implemented in the backend: no student authentication, teacher-protected endpoints, Session QR validation, DB-enforced uniqueness, and device-based attendance protection enforcement.

    CheckExpired -->|Yes| Error403b[403 Forbidden: Expired]
    Error403b --> LogError
    
    CheckExpired -->|No| CheckDuplicate{Duplicate?}
    CheckDuplicate -->|Yes| Error409[409 Conflict: Duplicate]
    Error409 --> LogError
    
    CheckDuplicate -->|No| ProcessSuccess[Process Successfully]
    ProcessSuccess --> SaveData[Save Data]
    SaveData --> Success{Save Successful?}
    
    Success -->|No| Error500[500 Internal Server Error]
    Error500 --> LogError
    
    Success -->|Yes| ReturnSuccess[Return Success Response]
    ReturnSuccess --> End([End])
    ReturnError --> End
    
    style Start fill:#90EE90
    style End fill:#87CEEB
    style Validate fill:#FFD700
    style CheckSession fill:#FFD700
    style CheckActive fill:#FFD700
    style CheckExpired fill:#FFD700
    style CheckDuplicate fill:#FFD700
    style Success fill:#FFD700
    style Error400 fill:#FFB6C1
    style Error404 fill:#FFB6C1
    style Error403a fill:#FFB6C1
    style Error403b fill:#FFB6C1
    style Error409 fill:#FFB6C1
    style Error500 fill:#FFB6C1
```

---

## 7. Complete User Journey

### Teacher Journey

```mermaid
journey
    title Teacher Attendance Session Journey
    section Setup
      Open Interface: 5: Teacher
      Select Class: 4: Teacher
      Select Subject: 4: Teacher
      Select Section: 4: Teacher
      Set Duration: 3: Teacher
    section Session
      Start Session: 5: Teacher
      QR Code Generated: 5: System
      Display QR Code: 4: Teacher
      Monitor Attendance: 3: Teacher
    section Completion
      End Session: 5: Teacher
      Generate Report: 4: Teacher
      Download Report: 5: Teacher
      Review Report: 4: Teacher
```

### Student Journey

```mermaid
journey
    title Student Attendance Marking Journey
    section Scanning
      Open Camera: 5: Student
      Scan QR Code: 4: Student
      QR Code Detected: 5: System
    section Submission
      Enter Roll Number: 3: Student
      Submit Attendance: 4: Student
      Validation: 5: System
    section Result
      Success Message: 5: Student
      Attendance Recorded: 5: System
```

### Complete System Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: System Start
    
    Idle --> SessionCreation: Teacher Starts Session
    SessionCreation --> SessionActive: QR Generated
    
    SessionActive --> AttendanceMarking: Student Scans QR
    AttendanceMarking --> Validation: Student Submits
    
    Validation --> AttendanceSaved: Valid
    Validation --> AttendanceRejected: Invalid
    
    AttendanceSaved --> SessionActive: Continue
    AttendanceRejected --> SessionActive: Continue
    
    SessionActive --> SessionEnding: Teacher Ends
    SessionEnding --> ReportGeneration: Session Ended
    
    ReportGeneration --> ReportDownloaded: Report Generated
    ReportDownloaded --> Idle: Complete
    
    SessionActive --> SessionExpired: Time Expired
    SessionExpired --> Idle: Auto End
```

---

## 8. Data Flow Diagram

### Complete Data Flow

```mermaid
flowchart LR
    subgraph "Client Layer"
        TB[Teacher Browser]
        SB[Student Browser]
    end
    
    subgraph "API Layer"
        API[REST API]
    end
    
    subgraph "Service Layer"
        SS[Session Service]
        AS[Attendance Service]
        VS[Validation Service]
        RS[Report Service]
        QS[QR Service]
    end
    
    subgraph "Data Layer"
        SM[Session Model]
        AM[Attendance Model]
        DB[(Database)]
    end
    
    TB -->|HTTP| API
    SB -->|HTTP| API
    
    API --> SS
    API --> AS
    API --> RS
    
    SS --> VS
    SS --> QS
    SS --> SM
    
    AS --> VS
    AS --> AM
    
    RS --> SS
    RS --> AS
    
    SM --> DB
    AM --> DB
    
    style TB fill:#E1F5FF
    style SB fill:#E1F5FF
    style API fill:#FFF4E1
    style SS fill:#E8F5E9
    style AS fill:#E8F5E9
    style VS fill:#E8F5E9
    style RS fill:#E8F5E9
    style QS fill:#E8F5E9
    style DB fill:#FCE4EC
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026 | Abdul Hakeem Shah | Initial flowcharts |

---

**Document Status:** ✅ Approved  
**Review Date:** As needed  
**Distribution:** Development Team, Stakeholders

