# 🏗️ System Architecture Documentation
## QR-Based Proxy-Free Attendance System

**Version:** 1.0.0  
**Last Updated:** 2026  
**Document Type:** Technical Architecture

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Architecture](#system-architecture)
3. [Layered Architecture](#layered-architecture)
4. [Component Diagrams](#component-diagrams)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Sequence Diagrams](#sequence-diagrams)
7. [Deployment Architecture](#deployment-architecture)
8. [Technology Stack](#technology-stack)
9. [Design Patterns](#design-patterns)
10. [Security Architecture](#security-architecture)

---

## 1. Architecture Overview


# Architecture — AttendRevolution Backend

**Version:** 1.0.0  
**Last Updated:** 2026

This document describes the current backend architecture and flows. It focuses on the implemented behavior (no student login, teacher-only session management, QR-based attendance, and device-based protection).

---

## High Level Architecture

```mermaid
graph TB
    subgraph Clients
        T[Teacher UI]
        S[Student Mobile/Browser]
    end

    API[REST API Server<br/>Node.js + Express]
    DB[(MongoDB + Mongoose)]

    T -->|teacher-id header| API
    S -->|POST: attendance + headers| API
    API --> DB
```

Key points:
- Teacher endpoints require Teacher ID (`teacher-id` header) and use `teacherAuth` middleware.
- Students do not authenticate; they submit `rollNumber` and the scanned Session QR (`qrToken`).

---

## Core Components

- Controllers: route handlers that parse requests and forward to services.
- Services: business logic (`session.service`, `attendance.service`, `report.service`).
- Models: Mongoose models (`Session`, `Attendance`, `Teacher`).
- Middleware: `teacherAuth`, `errorHandler`.

---

## Data model & key constraints

- `Session` stores `qrToken`, `isActive`, `date`, `timeFrom`, `timeTo`, `teacherId`, etc.
- `Attendance` stores `rollNumber`, `sessionId`, `scannedAt`, `deviceHash`.
- Important indexes / constraints:
    - Unique compound index: `{ sessionId, rollNumber }` (prevents duplicate roll submissions)
    - Unique compound index: `{ sessionId, deviceHash }` (prevents multiple submissions from same device)

---

## Attendance marking flow (summary)

```mermaid
sequenceDiagram
    participant S as Student
    participant API as Attendance Controller
    participant AS as Attendance Service
    participant SS as Session Service
    participant DB as MongoDB

    S->>API: POST /api/v1/attendance/session/:sessionId/mark\n{ rollNumber, qrToken }
    API->>AS: markAttendance(sessionId, rollNumber, qrToken, userAgent, ip)
    AS->>SS: getSession(sessionId)
    SS-->>AS: session (with qrToken, time window, isActive)
    AS->>DB: find Attendance by { sessionId, deviceHash }
    DB-->>AS: exists? (if yes -> 403)
    AS->>DB: find Attendance by { sessionId, rollNumber }
    DB-->>AS: exists? (if yes -> 400 VALIDATION_ERROR)
    AS->>DB: insert Attendance { rollNumber, sessionId, scannedAt, deviceHash }
    DB-->>AS: saved
    AS-->>API: success (201)
    API-->>S: 201 Created
```

Device identity (`deviceHash`) is computed as `sha256(User-Agent | IP | sessionId)` by the service before the DB checks.

---

## Report generation flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant API as Report Controller
    participant RS as Report Service
    participant DB as MongoDB

    T->>API: GET /api/v1/reports/session/:sessionId/{csv|pdf}?startDate&endDate
    API->>RS: generateReport(sessionId, format, startDate, endDate)
    RS->>DB: query Attendance for sessionId (+ optional date filter) (lean projection)
    DB-->>RS: attendance rows
    RS->>RS: stream/format CSV or PDF
    RS-->>API: file path or stream
    API-->>T: file download
```

Reports are implemented to avoid N+1 queries by projecting only needed fields (`rollNumber`, `scannedAt`) and using `.lean()` for efficiency.

---

## Security & design notes

- No student login: students only submit `rollNumber` + `qrToken`. This reduces friction and keeps the UX simple.
- Teacher-only actions require `teacherAuth` using `teacher-id` header.
- Device-based attendance protection prevents the same device/browser from submitting attendance multiple times for the same session.
- Duplicate roll number prevention happens at both service level and DB/index level.

---

For API details see `docs/API.md` and for sequence diagrams see `FLOWCHARTS.md`.

    Note over T,DB: Report Generation
    T->>TB: Download report
    TB->>API: GET /api/session/:id/report
    API->>DB: Fetch attendance data
    DB-->>API: Attendance records
    API->>API: Generate CSV/PDF
    API-->>TB: File download
    TB-->>T: Save report
```

### 6.2 Error Handling Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant API as API Server
    participant VS as Validation Service
    participant DB as Database
    
    S->>API: POST /api/attendance/mark<br/>{sessionId, rollNo}
    API->>VS: Validate input
    alt Invalid Input
        VS-->>API: Validation error
        API-->>S: 400 Bad Request + Error message
    else Valid Input
        API->>DB: Check session
        alt Session Not Found
            DB-->>API: Session not found
            API-->>S: 404 Not Found + Error message
        else Session Inactive
            DB-->>API: Session inactive
            API-->>S: 403 Forbidden + Error message
        else Session Expired
            DB-->>API: Session expired
            API-->>S: 403 Forbidden + Error message
        else Duplicate Entry
            DB-->>API: Duplicate found
            API-->>S: 409 Conflict + Error message
        else Success
            DB-->>API: Attendance saved
            API-->>S: 200 OK + Success message
        end
    end
```

---

## 7. Deployment Architecture

### 7.1 MVP Deployment (Development)

```mermaid
graph TB
    subgraph "Development Environment"
        DEV[Development Server<br/>localhost:3000]
        FS[File System<br/>JSON Storage]
    end
    
    TB[Teacher Browser] --> DEV
    SB[Student Browser] --> DEV
    DEV --> FS
    
    style DEV fill:#e1f5ff
    style FS fill:#fce4ec
```

**Components:**
- Single Node.js server
- JSON file storage
- Local development environment
- No load balancing
- No database server

### 7.2 Production Deployment (Future)

```mermaid
graph TB
    subgraph "Client Layer"
        TB[Teacher Browser]
        SB[Student Browser]
    end
    
    subgraph "Load Balancer"
        LB[NGINX Load Balancer]
    end
    
    subgraph "Application Servers"
        APP1[Node.js Server 1]
        APP2[Node.js Server 2]
    end
    
    subgraph "Database Layer"
        DB[(MongoDB<br/>Primary)]
        DB_REPLICA[(MongoDB<br/>Replica)]
    end
    
    subgraph "Storage"
        FS[File System<br/>Reports]
    end
    
    TB --> LB
    SB --> LB
    LB --> APP1
    LB --> APP2
    APP1 --> DB
    APP2 --> DB
    DB --> DB_REPLICA
    APP1 --> FS
    APP2 --> FS
    
    style LB fill:#fff4e1
    style APP1 fill:#e1f5ff
    style APP2 fill:#e1f5ff
    style DB fill:#e8f5e9
    style DB_REPLICA fill:#e8f5e9
    style FS fill:#fce4ec
```

**Components:**
- Load balancer (NGINX)
- Multiple application servers
- MongoDB database cluster
- File storage for reports
- Monitoring and logging

---

## 8. Technology Stack

### 8.1 Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 | Latest | Markup structure |
| CSS3 | Latest | Styling and layout |
| JavaScript (ES6+) | Latest | Client-side logic |
| QR Scanner Library | Latest | QR code scanning |

### 8.2 Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| qrcode | Latest | QR code generation |
| csv-writer | Latest | CSV report generation |
| pdfkit | Latest | PDF report generation |
| uuid | Latest | Unique ID generation |

### 8.3 Data Storage

| Technology | Version | Purpose |
|-----------|---------|---------|
| JSON Files | - | MVP data storage |
| MongoDB | 6+ | Production database (future) |
| File System | - | Report storage |

### 8.4 Development Tools

| Tool | Purpose |
|------|---------|
| npm | Package management |
| Git | Version control |
| Postman | API testing |
| VS Code | Code editor |

---

## 9. Design Patterns

### 9.1 Patterns Used

#### 1. MVC (Model-View-Controller)
- **Model:** Data models (`session.model.js`, `attendance.model.js`)
- **View:** HTML templates and client-side JavaScript
- **Controller:** Route handlers (`session.controller.js`, `attendance.controller.js`)

#### 2. Service Layer Pattern
- Business logic separated into service classes
- Controllers delegate to services
- Services handle complex operations

#### 3. Repository Pattern
- Data access abstracted through models
- Models handle all database operations
- Services interact with models, not directly with storage

#### 4. Singleton Pattern
- Service instances created once
- Shared across application
- Efficient resource usage

#### 5. Factory Pattern
- QR code generation factory
- Report generation factory
- Creates objects based on parameters

### 9.2 Pattern Benefits

- **Maintainability:** Clear separation of concerns
- **Testability:** Each layer can be tested independently
- **Scalability:** Easy to add new features
- **Reusability:** Services can be reused across controllers

---

## 10. Security Architecture

### 10.1 Security Layers

```mermaid
graph TD
    subgraph "Input Validation Layer"
        IV[Input Validation<br/>Sanitization]
    end
    
    subgraph "Business Logic Layer"
        BL[Business Rules<br/>Validation]
    end
    
    subgraph "Data Layer"
        DL[Data Integrity<br/>Constraints]
    end
    
    Request --> IV
    IV --> BL
    BL --> DL
    
    style IV fill:#ffebee
    style BL fill:#fff3e0
    style DL fill:#e8f5e9
```

### 10.2 Security Measures

#### Input Validation
- **Server-side validation:** All inputs validated on server
- **Type checking:** Ensure correct data types
- **Range validation:** Roll numbers within allowed range
- **Sanitization:** Prevent injection attacks

#### Session Security
- **Time-limited sessions:** Automatic expiry
- **Unique session IDs:** UUID generation
- **Session state validation:** Check active status
- **Expiry enforcement:** Server-side time checks

#### Data Security
- **Duplicate prevention:** Server-side checks
- **Data integrity:** Validation before storage
- **Error handling:** No sensitive data in errors
- **Logging:** Audit trail for all operations

#### Proxy Prevention
- **Time windows:** Limited attendance window
- **Duplicate blocking:** One entry per roll number
- **Server validation:** All checks server-side
- **Real-time monitoring:** Teacher visibility

### 10.3 Security Best Practices

1. ✅ All validation server-side
2. ✅ No sensitive data in client
3. ✅ Input sanitization
4. ✅ Error messages don't leak information
5. ✅ Session expiry enforcement
6. ✅ Duplicate prevention
7. ✅ Audit logging

---

## 11. Scalability Considerations

### 11.1 Current Architecture (MVP)

- **Single server:** Handles all requests
- **JSON storage:** File-based persistence
- **Synchronous operations:** Sequential processing
- **Capacity:** 150-200 students per session

### 11.2 Future Scalability Path

#### Horizontal Scaling
- Load balancer for multiple servers
- Stateless application design
- Shared database

#### Database Migration
- JSON → MongoDB migration path
- Schema design supports migration
- Data migration scripts

#### Caching Strategy
- Session data caching
- QR code caching
- Report caching

#### Performance Optimization
- Database indexing
- Query optimization
- Connection pooling
- Async operations

---

## 12. Error Handling Architecture

### 12.1 Error Flow

```mermaid
graph TD
    Request --> Validate
    Validate -->|Error| FormatError
    Validate -->|Success| Process
    Process -->|Error| HandleError
    Process -->|Success| Response
    
    FormatError --> ErrorResponse
    HandleError --> LogError
    LogError --> ErrorResponse
    ErrorResponse --> Client
    
    style FormatError fill:#ffebee
    style HandleError fill:#ffebee
    style ErrorResponse fill:#ffebee
```

### 12.2 Error Categories

1. **Validation Errors (400):** Invalid input format
2. **Not Found (404):** Session doesn't exist
3. **Forbidden (403):** Session inactive/expired
4. **Conflict (409):** Duplicate entry
5. **Server Error (500):** Internal server errors

### 12.3 Error Handling Strategy

- **Consistent error format:** Standardized error responses
- **Error logging:** All errors logged server-side
- **User-friendly messages:** Clear error messages
- **Graceful degradation:** System continues operating

---

## 13. Monitoring and Logging

### 13.1 Logging Strategy

**Log Levels:**
- **INFO:** Normal operations (session created, attendance marked)
- **WARN:** Potential issues (duplicate attempts, expired sessions)
- **ERROR:** System errors (validation failures, storage errors)

**Log Information:**
- Timestamp
- Request details
- User actions
- System responses
- Error details

### 13.2 Monitoring Points

1. **Session creation rate**
2. **Attendance submission rate**
3. **Error rate**
4. **Response times**
5. **Storage usage**
6. **Concurrent sessions**

---

## 14. Conclusion

This architecture provides a solid foundation for the QR-Based Attendance System, balancing simplicity for MVP requirements with scalability for future growth. The layered approach ensures maintainability, testability, and extensibility.

**Key Strengths:**
- Clear separation of concerns
- Scalable design patterns
- Security-first approach
- Future-ready architecture

**Next Steps:**
1. Review API specifications (see API_DOCUMENTATION.md)
2. Review database schema (see DATABASE_SCHEMA.md)
3. Begin implementation following this architecture

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026 | Abdul Hakeem Shah | Initial architecture documentation |

---

**Document Status:** ✅ Approved  
**Review Date:** Quarterly  
**Distribution:** Development Team, Technical Leads

