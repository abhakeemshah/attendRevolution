# 💾 Database Schema Documentation
## QR-Based Proxy-Free Attendance System

**Version:** 1.0.0  
**Last Updated:** 2026  
**Storage Type:** JSON Files (MVP) / MongoDB (Production)

---

## Table of Contents

1. [Overview](#overview)
2. [Data Storage Strategy](#data-storage-strategy)
3. [Data Models](#data-models)
4. [JSON Schema (MVP)](#json-schema-mvp)
5. [MongoDB Schema (Production)](#mongodb-schema-production)
6. [Data Relationships](#data-relationships)
7. [Indexes](#indexes)
8. [Data Validation](#data-validation)
9. [Migration Strategy](#migration-strategy)

---

## 1. Overview

### 1.1 Storage Approach

**MVP Phase:** JSON File Storage
- Simple file-based storage
- No database server required
- Easy to understand and debug
- Suitable for development and small-scale deployment

**Production Phase:** MongoDB
- Document-based NoSQL database
- Scalable and performant
- Supports complex queries
- Better for production environments

### 1.2 Data Entities

1. **Session:** Attendance session information
2. **Attendance:** Individual attendance records

---

## 2. Data Storage Strategy

### 2.1 File Structure (MVP)

```
server/
└── data/
    ├── sessions.json      # Session records
    └── attendance.json    # Attendance records
```

### 2.2 File Format

- **Format:** JSON (JavaScript Object Notation)
- **Encoding:** UTF-8
- **Structure:** Array of objects
- **Backup:** Daily backups recommended

### 2.3 Data Persistence

- **Write Strategy:** Synchronous file writes
- **Read Strategy:** In-memory caching with file refresh
- **Concurrency:** File locking for write operations
- **Backup:** Automatic backup before writes

---

## 3. Data Models

### 3.1 Session Model

**Purpose:** Represents an attendance session

**Key Attributes:**
- Unique session identifier
- Class, subject, section information
- Time boundaries (start/end)
- Active status
- QR code data

**Lifecycle:**
1. Created when teacher starts session
2. Active during attendance window
3. Inactive when ended or expired

### 3.2 Attendance Model

**Purpose:** Represents individual student attendance

**Key Attributes:**
- Session reference
- Roll number
- Timestamp
- Status

**Constraints:**
- One record per roll number per session
- Linked to active session only
- Timestamped for audit trail

---

## 4. JSON Schema (MVP)

### 4.1 Session Schema

**File:** `server/data/sessions.json`

**Structure:**
```json
[
  {
    "sessionId": "string (UUID)",
    "class": "string",
    "subject": "string",
    "section": "string",
    "duration": "number (minutes)",
    "startTime": "ISO 8601 timestamp",
    "endTime": "ISO 8601 timestamp",
    "isActive": "boolean",
    "createdAt": "ISO 8601 timestamp",
    "endedAt": "ISO 8601 timestamp (optional)"
  }
]
```

**Example:**
```json
[
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "class": "CS-101",
    "subject": "Data Structures",
    "section": "A",
    "duration": 5,
    "startTime": "2026-01-15T10:00:00Z",
    "endTime": "2026-01-15T10:05:00Z",
    "isActive": true,
    "createdAt": "2026-01-15T09:59:45Z",
    "endedAt": null
  }
]
```

**Field Descriptions:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| sessionId | string (UUID) | Yes | Unique session identifier | Valid UUID v4 |
| class | string | Yes | Class identifier | 1-50 characters |
| subject | string | Yes | Subject name | 1-100 characters |
| section | string | Yes | Section identifier | 1-10 characters |
| duration | number | Yes | Session duration in minutes | 3-10 minutes |
| startTime | string (ISO 8601) | Yes | Session start timestamp | Valid ISO 8601 |
| endTime | string (ISO 8601) | Yes | Session end timestamp | Must be after startTime |
| isActive | boolean | Yes | Session active status | true/false |
| createdAt | string (ISO 8601) | Yes | Record creation timestamp | Valid ISO 8601 |
| endedAt | string (ISO 8601) | No | Session end timestamp | Valid ISO 8601 or null |

### 4.2 Attendance Schema

**File:** `server/data/attendance.json`

**Structure:**
```json
[
  {
    "sessionId": "string (UUID)",
    "rollNo": "number",
    "timestamp": "ISO 8601 timestamp",
    "status": "string",
    "createdAt": "ISO 8601 timestamp"
  }
]
```

**Example:**
```json
[
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "rollNo": 12345,
    "timestamp": "2026-01-15T10:00:15Z",
    "status": "present",
    "createdAt": "2026-01-15T10:00:15Z"
  },
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "rollNo": 12346,
    "timestamp": "2026-01-15T10:00:22Z",
    "status": "present",
    "createdAt": "2026-01-15T10:00:22Z"
  }
]
```

**Field Descriptions:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| sessionId | string (UUID) | Yes | Reference to session | Must exist in sessions.json |
| rollNo | number | Yes | Student roll number | 1-999999 |
| timestamp | string (ISO 8601) | Yes | Attendance timestamp | Valid ISO 8601 |
| status | string | Yes | Attendance status | "present" or "rejected" |
| createdAt | string (ISO 8601) | Yes | Record creation timestamp | Valid ISO 8601 |

**Composite Unique Constraint:**
- `(sessionId, rollNo)` must be unique

---

## 5. MongoDB Schema (Production)

### 5.1 Sessions Collection

**Collection Name:** `sessions`

**Schema:**
```javascript
{
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  class: {
    type: String,
    required: true,
    maxlength: 50
  },
  subject: {
    type: String,
    required: true,
    maxlength: 100
  },
  section: {
    type: String,
    required: true,
    maxlength: 10
  },
  duration: {
    type: Number,
    required: true,
    min: 3,
    max: 10
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
}
```

**Indexes:**
```javascript
// Single field indexes
db.sessions.createIndex({ sessionId: 1 }, { unique: true })
db.sessions.createIndex({ isActive: 1 })
db.sessions.createIndex({ startTime: 1 })

// Compound index
db.sessions.createIndex({ isActive: 1, startTime: 1 })
```

### 5.2 Attendance Collection

**Collection Name:** `attendance`

**Schema:**
```javascript
{
  sessionId: {
    type: String,
    required: true,
    index: true,
    ref: 'sessions'
  },
  rollNo: {
    type: Number,
    required: true,
    min: 1,
    max: 999999
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'rejected'],
    default: 'present'
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}
```

**Indexes:**
```javascript
// Single field indexes
db.attendance.createIndex({ sessionId: 1 })
db.attendance.createIndex({ rollNo: 1 })
db.attendance.createIndex({ timestamp: 1 })

// Compound unique index (prevents duplicates)
db.attendance.createIndex(
  { sessionId: 1, rollNo: 1 },
  { unique: true }
)

// Compound index for queries
db.attendance.createIndex({ sessionId: 1, timestamp: 1 })
```

### 5.3 Mongoose Models

**Session Model:**
```javascript
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true,
    maxlength: 50
  },
  subject: {
    type: String,
    required: true,
    maxlength: 100
  },
  section: {
    type: String,
    required: true,
    maxlength: 10
  },
  duration: {
    type: Number,
    required: true,
    min: 3,
    max: 10
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Session', sessionSchema);
```

**Attendance Model:**
```javascript
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    ref: 'Session'
  },
  rollNo: {
    type: Number,
    required: true,
    min: 1,
    max: 999999
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'rejected'],
    default: 'present'
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Compound unique index
attendanceSchema.index({ sessionId: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
```

---

## 6. Data Relationships

### 6.1 Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Session   │◄────────│  Attendance  │
│             │   1:N   │              │
│ sessionId   │         │ sessionId    │
│ class       │         │ rollNo       │
│ subject     │         │ timestamp    │
│ section     │         │ status       │
│ duration    │         └──────────────┘
│ startTime   │
│ endTime     │
│ isActive    │
└─────────────┘
```

### 6.2 Relationship Rules

1. **One-to-Many:** One session can have many attendance records
2. **Referential Integrity:** Attendance records must reference valid sessions
3. **Cascade Behavior:** When session is deleted, attendance records are archived (not deleted)
4. **Unique Constraint:** One attendance record per roll number per session

### 6.3 Query Patterns

**Get session with attendance count:**
```javascript
// MongoDB
db.attendance.aggregate([
  { $match: { sessionId: "session-id" } },
  { $group: { _id: "$sessionId", count: { $sum: 1 } } }
])
```

**Get attendance for session:**
```javascript
// MongoDB
db.attendance.find({ sessionId: "session-id" }).sort({ timestamp: 1 })
```

---

## 7. Indexes

### 7.1 Session Indexes

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Primary | sessionId | Unique | Fast session lookup |
| Active Sessions | isActive, startTime | Compound | Query active sessions |
| Time Range | startTime | Single | Time-based queries |

### 7.2 Attendance Indexes

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Session Lookup | sessionId | Single | Fast attendance retrieval |
| Duplicate Prevention | sessionId, rollNo | Unique Compound | Prevent duplicates |
| Time Queries | timestamp | Single | Time-based sorting |
| Roll Number | rollNo | Single | Student-specific queries |

### 7.3 Index Performance

**Query Optimization:**
- Session lookup: O(log n) with index
- Duplicate check: O(log n) with compound index
- Attendance retrieval: O(log n) with sessionId index

---

## 8. Data Validation

### 8.1 Input Validation Rules

#### Session Validation
- ✅ sessionId: Valid UUID v4 format
- ✅ class: Non-empty, max 50 characters
- ✅ subject: Non-empty, max 100 characters
- ✅ section: Non-empty, max 10 characters
- ✅ duration: Integer between 3 and 10
- ✅ startTime: Valid ISO 8601 date, before endTime
- ✅ endTime: Valid ISO 8601 date, after startTime

#### Attendance Validation
- ✅ sessionId: Valid UUID, exists in sessions
- ✅ rollNo: Integer between 1 and 999999
- ✅ timestamp: Valid ISO 8601 date
- ✅ status: One of ["present", "rejected"]
- ✅ Duplicate check: (sessionId, rollNo) combination unique

### 8.2 Business Rule Validation

1. **Session Active Check:** Attendance can only be marked for active sessions
2. **Session Expiry Check:** Attendance cannot be marked after session endTime
3. **Roll Number Range:** Roll numbers must be within institution's range
4. **Duplicate Prevention:** Same roll number cannot mark attendance twice in same session

### 8.3 Data Integrity Constraints

**Referential Integrity:**
- Attendance.sessionId must reference existing Session.sessionId
- Cannot delete session with existing attendance records (soft delete)

**Uniqueness Constraints:**
- Session.sessionId: Unique
- Attendance(sessionId, rollNo): Unique combination

**Temporal Constraints:**
- Session.endTime > Session.startTime
- Attendance.timestamp within Session time window (if session active)

---

## 9. Migration Strategy

### 9.1 JSON to MongoDB Migration

**Migration Script Structure:**
```javascript
// migration/json-to-mongodb.js

const fs = require('fs');
const mongoose = require('mongoose');
const Session = require('./models/session.model');
const Attendance = require('./models/attendance.model');

async function migrate() {
  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/attendance');
  
  // Read JSON files
  const sessions = JSON.parse(
    fs.readFileSync('./data/sessions.json', 'utf8')
  );
  const attendance = JSON.parse(
    fs.readFileSync('./data/attendance.json', 'utf8')
  );
  
  // Migrate sessions
  for (const session of sessions) {
    await Session.create({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      createdAt: new Date(session.createdAt),
      endedAt: session.endedAt ? new Date(session.endedAt) : null
    });
  }
  
  // Migrate attendance
  for (const record of attendance) {
    await Attendance.create({
      ...record,
      timestamp: new Date(record.timestamp),
      createdAt: new Date(record.createdAt)
    });
  }
  
  console.log('Migration completed');
  await mongoose.disconnect();
}

migrate();
```

### 9.2 Migration Checklist

- [ ] Backup existing JSON files
- [ ] Set up MongoDB database
- [ ] Create collections with schemas
- [ ] Create indexes
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Update application code to use MongoDB
- [ ] Test all operations
- [ ] Archive JSON files (keep as backup)

### 9.3 Rollback Strategy

**If migration fails:**
1. Keep JSON files as backup
2. Restore from backup if needed
3. Continue using JSON storage
4. Fix migration issues
5. Retry migration

---

## 10. Data Backup and Recovery

### 10.1 Backup Strategy

**JSON Files (MVP):**
- Daily automated backups
- Backup before major operations
- Store backups in separate directory
- Keep last 30 days of backups

**MongoDB (Production):**
- Daily automated backups using `mongodump`
- Weekly full backups
- Monthly archive backups
- Off-site backup storage

### 10.2 Recovery Procedures

**JSON Recovery:**
```bash
# Restore from backup
cp backups/sessions_2026-01-15.json data/sessions.json
cp backups/attendance_2026-01-15.json data/attendance.json
```

**MongoDB Recovery:**
```bash
# Restore from backup
mongorestore --db attendance backups/attendance_2026-01-15
```

---

## 11. Data Retention Policy

### 11.1 Retention Rules

- **Active Sessions:** Keep all active sessions
- **Completed Sessions:** Keep for current semester
- **Attendance Records:** Keep for current semester
- **Archived Data:** Move to archive after semester ends

### 11.2 Archive Strategy

- Move old data to archive collections/tables
- Compress archived data
- Store archives separately
- Maintain archive for 2 years

---

## 12. Performance Considerations

### 12.1 JSON File Performance

**Optimizations:**
- In-memory caching of file contents
- Lazy loading of data
- Batch writes when possible
- File locking for concurrent access

**Limitations:**
- File size grows with data
- Slower queries on large datasets
- No advanced query capabilities

### 12.2 MongoDB Performance

**Optimizations:**
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas for scaling

**Advantages:**
- Fast queries with indexes
- Scalable architecture
- Advanced query capabilities
- Better concurrency handling

---

## 13. Data Security

### 13.1 Access Control

- **File Permissions:** Restrict read/write access to application user
- **Database Access:** Use authentication and authorization
- **Network Security:** Encrypt connections (TLS/SSL)

### 13.2 Data Protection

- **Encryption at Rest:** Encrypt sensitive data files
- **Encryption in Transit:** Use HTTPS/TLS
- **Backup Encryption:** Encrypt backup files
- **Audit Logging:** Log all data access

---

## 14. Conclusion

This schema design provides a solid foundation for both MVP (JSON) and production (MongoDB) phases. The structure is simple yet scalable, ensuring data integrity and performance.

**Key Features:**
- Clear data models
- Proper relationships
- Efficient indexing
- Validation rules
- Migration path

**Next Steps:**
1. Implement JSON file storage (MVP)
2. Create data access layer
3. Implement validation
4. Plan MongoDB migration

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026 | Abdul Hakeem Shah | Initial schema documentation |

---

**Document Status:** ✅ Approved  
**Review Date:** Quarterly  
**Distribution:** Development Team, Database Administrators

