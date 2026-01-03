# 📘 QR-Based Proxy-Free Attendance System

**A modern, efficient web-based attendance management system designed for large classrooms (150-200 students)**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **QR-Based Proxy-Free Attendance System** is a modern solution that replaces traditional paper-based attendance tracking with a fast, reliable, and automated QR code-based system. Designed specifically for large classroom environments, the system enables teachers to complete attendance in under 5 minutes while students can mark their attendance in under 10 seconds.

### Key Highlights

- ⚡ **Fast:** Complete attendance in under 5 minutes
- 📱 **Mobile-Friendly:** Works on any device with a camera
- 🔒 **Secure:** Server-side validation prevents proxy attendance
- 📊 **Automated Reports:** Generate CSV and PDF reports instantly
- 🎯 **Simple:** Zero learning curve for students
- 📈 **Scalable:** Supports 150+ concurrent students

---

## ✨ Features

### For Teachers
- ✅ Create attendance sessions with class, subject, and section
- ✅ Generate time-limited QR codes (3-5 minutes)
- ✅ Monitor live attendance count
- ✅ End sessions manually or automatically
- ✅ Download attendance reports (CSV/PDF)

### For Students
- ✅ Scan QR code using mobile browser
- ✅ Enter roll number to mark attendance
- ✅ Receive instant feedback
- ✅ No app installation required

### System Features
- ✅ Time-limited QR codes prevent proxy attendance
- ✅ Server-side duplicate prevention
- ✅ Real-time validation
- ✅ Automatic session expiry
- ✅ Comprehensive error handling
- ✅ Audit trail for all operations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd attendRevolution

# Install backend dependencies
npm install

# Create a .env file in the server directory
cp server/.env.example server/.env

# Update the .env file with your MongoDB connection string and JWT secret
# MONGODB_URI=mongodb://localhost:27017/attend-revolution
# JWT_SECRET=your-super-secret-key

# Start the server
npm start
```

### Access the Application

- **API Endpoint:** http://localhost:3000/api/v1

---

## 📚 Documentation

Comprehensive documentation is available for all aspects of the project:

### Core Documentation

| Document | Description |
|----------|-------------|
| [📘 Project Documentation](./PROJECT_DOCUMENTATION.md) | Complete project overview, requirements, and scope |
| [🏗️ Architecture Documentation](./ARCHITECTURE.md) | System architecture, components, and design patterns |
| [🔌 API Documentation](./API_DOCUMENTATION.md) | Complete REST API reference with examples |
| [💾 Database Schema](./DATABASE_SCHEMA.md) | Data models, schemas, and relationships |
| [🚀 Setup Guide](./SETUP_GUIDE.md) | Detailed installation and configuration guide |
| [📅 Project Plan](./PROJECT_PLAN.md) | Timeline, milestones, and project management |
| [🚀 Complete Beginner Guide](./COMPLETE_GUIDE.md) | **START HERE** - Step-by-step guide from zero to completion |

### Quick Links

- [Architecture Overview](./ARCHITECTURE.md#architecture-overview)
- [API Endpoints](./API_DOCUMENTATION.md)
- [Database Models](./DATABASE_SCHEMA.md#data-models)
- [Installation Steps](./SETUP_GUIDE.md#installation-steps)
- [Project Timeline](./PROJECT_PLAN.md#detailed-timeline)

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Client         │
│ (Browser/Mobile)│
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────────┐
│ Node.js + Express   │
│      Server         │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  MongoDB            │
│ (Mongoose)          │
└─────────────────────┘
```

### Layered Architecture

```
Presentation Layer (UI)
         ↓
Controller Layer (Routes)
         ↓
Service Layer (Business Logic)
         ↓
Data Layer (Mongoose Models)
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **QR Generation:** qrcode
- **Reports:** csv-writer, pdfkit

### Frontend
- To be built separately.

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Testing:** Jest, Supertest
- **Code Quality:** ESLint

---

## 📁 Project Structure

```
attendRevolution/
│
├── server/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── reports/
│   ├── csv/
│   └── pdf/
│
├── docs/
│
├── package.json
└── README.md
```

---

## 🔌 API Documentation

All API endpoints are versioned under `/api/v1`. For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Reference

#### Register
```http
POST /api/v1/auth/register
```

#### Login
```http
POST /api/v1/auth/login
```

#### Create Session
```http
POST /api/v1/session
```

#### Mark Attendance
```http
POST /api/v1/attendance/session/:sessionId/mark
```

#### Download Report
```http
GET /api/v1/reports/session/:sessionId/:format
```

---

## 💻 Usage

The backend is now an API-first service. The frontend will be built separately to consume these APIs.

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test
```

### Test Coverage

Target: >80% code coverage

---

## 🚧 Roadmap

### MVP (Current)
- ✅ Core attendance functionality
- ✅ QR code generation
- ✅ Report generation (CSV/PDF)
- ✅ User authentication and authorization (JWT)
- ✅ Role-based access control (Teacher/Student)
- ✅ MongoDB integration with Mongoose

### Phase 2 (Future)
- 🔄 Advanced proxy prevention (MAC address, device fingerprinting)
- 🔄 Analytics dashboard
- 🔄 Mobile applications
- 🔄 ERP integration
- 🔄 Admin panel for user management
---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Development Team**
- Project Lead
- Backend Developer
- Frontend Developer

---

## 🙏 Acknowledgments

- QR code libraries and tools
- Open-source community
- Educational institutions for feedback

---

## 📞 Support

For support, please:
1. Check the [documentation](./docs/)
2. Review [troubleshooting guide](./SETUP_GUIDE.md#troubleshooting)
3. Open an issue on GitHub

---

## 📈 Project Status

**Current Phase:** Planning & Design  
**Version:** 1.0.0  
**Status:** 🟢 Active Development

---

## 🔗 Quick Links

- [📘 Full Documentation](./PROJECT_DOCUMENTATION.md)
- [🏗️ Architecture Details](./ARCHITECTURE.md)
- [🔌 API Reference](./API_DOCUMENTATION.md)
- [💾 Database Schema](./DATABASE_SCHEMA.md)
- [🚀 Setup Guide](./SETUP_GUIDE.md)
- [📅 Project Timeline](./PROJECT_PLAN.md)

---

**Built with ❤️ for modern education by Abdul Hakeem Shah**

*Last Updated: 2026*

