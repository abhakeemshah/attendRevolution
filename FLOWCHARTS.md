# 📊 System Flowcharts
## QR-Based Proxy-Free Attendance System

**Version:** 1.0.0  
**Last Updated:** 2026

---

## Table of Contents

1. [System Overview Flow](#system-overview-flow)
2. [Session Creation Flow](#session-creation-flow)
3. [Attendance Marking Flow](#attendance-marking-flow)
4. [Session End Flow](#session-end-flow)
5. [Report Generation Flow](#report-generation-flow)
6. [Error Handling Flow](#error-handling-flow)
7. [Complete User Journey](#complete-user-journey)

---

## 1. System Overview Flow

### High-Level System Flow

```mermaid
flowchart TD
    Start([System Start]) --> Teacher[Teacher Opens Interface]
    Teacher --> CreateSession[Create Attendance Session]
    CreateSession --> GenerateQR[Generate QR Code]
    GenerateQR --> DisplayQR[Display QR Code]
    DisplayQR --> Wait[Wait for Students]
    
    Wait --> StudentScan[Student Scans QR]
    StudentScan --> EnterRoll[Enter Roll Number]
    EnterRoll --> Validate[Validate Input]
    Validate --> CheckDuplicate{Duplicate?}
    
    CheckDuplicate -->|Yes| Reject[Reject Attendance]
    CheckDuplicate -->|No| Save[Save Attendance]
    
    Save --> UpdateCount[Update Attendance Count]
    Reject --> Wait
    UpdateCount --> Wait
    
    Wait --> EndSession{End Session?}
    EndSession -->|No| Wait
    EndSession -->|Yes| GenerateReport[Generate Report]
    GenerateReport --> Download[Download Report]
    Download --> End([End])
    
    style Start fill:#90EE90
    style End fill:#FFB6C1
    style Validate fill:#87CEEB
    style CheckDuplicate fill:#FFD700
```

---

## 2. Session Creation Flow

### Teacher Creates Attendance Session

```mermaid
sequenceDiagram
    participant T as Teacher
    participant UI as Teacher Interface
    participant API as API Server
    participant VS as Validation Service
    participant SS as Session Service
    participant QS as QR Service
    participant DB as Database
    
    T->>UI: Fill Form (Class, Subject, Section, Duration)
    T->>UI: Click "Start Session"
    UI->>API: POST /api/session/start
    API->>VS: Validate Input
    VS-->>API: Validation Result
    
    alt Invalid Input
        API-->>UI: 400 Bad Request + Error
        UI-->>T: Display Error Message
    else Valid Input
        API->>SS: createSession(params)
        SS->>VS: Validate Business Rules
        VS-->>SS: Valid
        
        SS->>QS: generateQR(sessionId, expiry)
        QS-->>SS: QR Code Data
        
        SS->>DB: Save Session
        DB-->>SS: Session Saved
        
        SS-->>API: Session Created
        API-->>UI: 201 Created + Session Data
        UI->>UI: Display QR Code
        UI->>UI: Start Countdown Timer
        UI-->>T: Show Success + QR Code
    end
```

### Session Creation Decision Tree

```mermaid
flowchart TD
    Start([Teacher Starts Session]) --> Input[Enter Class, Subject, Section, Duration]
    Input --> ValidateInput{Input Valid?}
    
    ValidateInput -->|No| Error1[Show Error: Invalid Input]
    Error1 --> Input
    
    ValidateInput -->|Yes| CreateSession[Create Session Object]
    CreateSession --> GenerateID[Generate Session ID]
    GenerateID --> CalculateTime[Calculate Start/End Time]
    CalculateTime --> GenerateQR[Generate QR Code]
    GenerateQR --> SaveDB[Save to Database]
    
    SaveDB --> Success{Save Successful?}
    Success -->|No| Error2[Show Error: Database Error]
    Error2 --> Input
    
    Success -->|Yes| DisplayQR[Display QR Code]
    DisplayQR --> StartTimer[Start Countdown Timer]
    StartTimer --> Monitor[Monitor Live Attendance]
    Monitor --> End([Session Active])
    
    style Start fill:#90EE90
    style End fill:#87CEEB
    style ValidateInput fill:#FFD700
    style Success fill:#FFD700
```

---

## 3. Attendance Marking Flow

### Student Marks Attendance

```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Student Interface
    participant API as API Server
    participant VS as Validation Service
    participant AS as Attendance Service
    participant SS as Session Service
    participant DB as Database
    
    S->>UI: Scan QR Code
    UI->>UI: Parse QR Data
    UI->>UI: Extract Session ID
    UI->>S: Show Roll Number Input
    
    S->>UI: Enter Roll Number
    S->>UI: Click Submit
    UI->>API: POST /api/attendance/mark
    
    API->>VS: Validate Input Format
    VS-->>API: Format Valid
    
    API->>AS: markAttendance(sessionId, rollNo)
    AS->>SS: getSession(sessionId)
    SS-->>AS: Session Data
    
    AS->>VS: Validate Session Active
    VS-->>AS: Session Active
    
    AS->>VS: Validate Not Expired
    VS-->>AS: Not Expired
    
    AS->>VS: Validate Roll Number Range
    VS-->>AS: Valid Range
    
    AS->>DB: Check Duplicate
    DB-->>AS: No Duplicate Found
    
    AS->>DB: Save Attendance
    DB-->>AS: Attendance Saved
    
    AS-->>API: Success
    API-->>UI: 200 OK + Success Message
    UI-->>S: Show Success Message
```

### Attendance Validation Flow

```mermaid
flowchart TD
    Start([Student Submits Attendance]) --> ValidateFormat{Input Format Valid?}
    
    ValidateFormat -->|No| Error1[Error: Invalid Format]
    Error1 --> End1([End])
    
    ValidateFormat -->|Yes| CheckSession{Session Exists?}
    CheckSession -->|No| Error2[Error: Session Not Found]
    Error2 --> End2([End])
    
    CheckSession -->|Yes| CheckActive{Session Active?}
    CheckActive -->|No| Error3[Error: Session Inactive]
    Error3 --> End3([End])
    
    CheckActive -->|Yes| CheckExpired{Session Expired?}
    CheckExpired -->|Yes| Error4[Error: Session Expired]
    Error4 --> End4([End])
    
    CheckExpired -->|No| CheckRollRange{Roll Number in Range?}
    CheckRollRange -->|No| Error5[Error: Invalid Roll Number]
    Error5 --> End5([End])
    
    CheckRollRange -->|Yes| CheckDuplicate{Duplicate Entry?}
    CheckDuplicate -->|Yes| Error6[Error: Already Marked]
    CheckDuplicate -->|No| SaveAttendance[Save Attendance]
    
    SaveAttendance --> Success[Success: Attendance Marked]
    Success --> End6([End])
    
    style Start fill:#90EE90
    style Success fill:#90EE90
    style ValidateFormat fill:#FFD700
    style CheckSession fill:#FFD700
    style CheckActive fill:#FFD700
    style CheckExpired fill:#FFD700
    style CheckRollRange fill:#FFD700
    style CheckDuplicate fill:#FFD700
```

---

## 4. Session End Flow

### Teacher Ends Session

```mermaid
sequenceDiagram
    participant T as Teacher
    participant UI as Teacher Interface
    participant API as API Server
    participant SS as Session Service
    participant DB as Database
    
    T->>UI: Click "End Session"
    UI->>T: Confirm End Session?
    T->>UI: Confirm
    
    UI->>API: POST /api/session/end
    API->>SS: endSession(sessionId)
    SS->>DB: Get Session
    DB-->>SS: Session Data
    
    SS->>SS: Check Session Exists
    alt Session Not Found
        SS-->>API: Error: Session Not Found
        API-->>UI: 404 Not Found
        UI-->>T: Show Error
    else Session Already Ended
        SS-->>API: Error: Already Ended
        API-->>UI: 403 Forbidden
        UI-->>T: Show Error
    else Session Active
        SS->>DB: Update Session (isActive: false)
        DB-->>SS: Session Updated
        SS->>DB: Get Attendance Count
        DB-->>SS: Attendance Count
        SS-->>API: Success + Count
        API-->>UI: 200 OK + Data
        UI->>UI: Update UI (Disable QR, Show Count)
        UI-->>T: Show Success + Total Attendance
    end
```

### Session End Decision Tree

```mermaid
flowchart TD
    Start([Teacher Ends Session]) --> Confirm{Confirm End?}
    Confirm -->|No| Cancel([Cancel])
    
    Confirm -->|Yes| CheckSession{Session Exists?}
    CheckSession -->|No| Error1[Error: Not Found]
    Error1 --> End1([End])
    
    CheckSession -->|Yes| CheckActive{Session Active?}
    CheckActive -->|No| Error2[Error: Already Ended]
    Error2 --> End2([End])
    
    CheckActive -->|Yes| UpdateStatus[Set isActive = false]
    UpdateStatus --> SetEndTime[Set endTime = now]
    SetEndTime --> GetCount[Get Attendance Count]
    GetCount --> UpdateUI[Update UI]
    UpdateUI --> Success[Success: Session Ended]
    Success --> End3([End])
    
    style Start fill:#90EE90
    style Success fill:#90EE90
    style Confirm fill:#FFD700
    style CheckSession fill:#FFD700
    style CheckActive fill:#FFD700
```

---

## 5. Report Generation Flow

### Generate and Download Report

```mermaid
sequenceDiagram
    participant T as Teacher
    participant UI as Teacher Interface
    participant API as API Server
    participant RS as Report Service
    participant SS as Session Service
    participant AS as Attendance Service
    participant CSV as CSV Generator
    participant PDF as PDF Generator
    participant FS as File System
    
    T->>UI: Click "Download Report"
    UI->>UI: Select Format (CSV/PDF)
    UI->>API: GET /api/session/:id/report?format=csv
    
    API->>RS: generateReport(sessionId, format)
    RS->>SS: getSession(sessionId)
    SS-->>RS: Session Data
    
    RS->>AS: getAttendanceBySession(sessionId)
    AS-->>RS: Attendance Records
    
    alt Format = CSV
        RS->>CSV: generateCSV(sessionData, attendance)
        CSV-->>RS: CSV Buffer
        RS->>FS: Save CSV File
        FS-->>RS: File Saved
        RS-->>API: CSV File
        API-->>UI: CSV Download
    else Format = PDF
        RS->>PDF: generatePDF(sessionData, attendance)
        PDF-->>RS: PDF Buffer
        RS->>FS: Save PDF File
        FS-->>RS: File Saved
        RS-->>API: PDF File
        API-->>UI: PDF Download
    end
    
    UI-->>T: File Download Complete
```

### Report Generation Process

```mermaid
flowchart TD
    Start([Request Report]) --> GetSession[Get Session Data]
    GetSession --> GetAttendance[Get Attendance Records]
    GetAttendance --> SelectFormat{Format?}
    
    SelectFormat -->|CSV| GenerateCSV[Generate CSV]
    SelectFormat -->|PDF| GeneratePDF[Generate PDF]
    
    GenerateCSV --> FormatCSV[Format CSV Data]
    FormatCSV --> SaveCSV[Save CSV File]
    SaveCSV --> ReturnCSV[Return CSV]
    
    GeneratePDF --> FormatPDF[Format PDF Data]
    FormatPDF --> CreatePDF[Create PDF Document]
    CreatePDF --> SavePDF[Save PDF File]
    SavePDF --> ReturnPDF[Return PDF]
    
    ReturnCSV --> Download[Download File]
    ReturnPDF --> Download
    Download --> End([End])
    
    style Start fill:#90EE90
    style End fill:#87CEEB
    style SelectFormat fill:#FFD700
```

---

## 6. Error Handling Flow

### Complete Error Handling

```mermaid
flowchart TD
    Start([API Request]) --> Validate{Validate Request}
    
    Validate -->|Invalid| Error400[400 Bad Request]
    Error400 --> LogError[Log Error]
    LogError --> ReturnError[Return Error Response]
    
    Validate -->|Valid| Process[Process Request]
    Process --> CheckSession{Session Exists?}
    
    CheckSession -->|No| Error404[404 Not Found]
    Error404 --> LogError
    
    CheckSession -->|Yes| CheckActive{Session Active?}
    CheckActive -->|No| Error403a[403 Forbidden: Inactive]
    Error403a --> LogError
    
    CheckActive -->|Yes| CheckExpired{Expired?}
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

