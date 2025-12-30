# 🚀 Setup and Installation Guide
## QR-Based Proxy-Free Attendance System

**Version:** 1.0.0  
**Last Updated:** 2026  
**Target Platform:** Windows / macOS / Linux

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Development Setup](#development-setup)
9. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

### 1.1 Required Software

Before installing the attendance system, ensure you have the following installed:

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| Node.js | 18.0.0 or higher | Runtime environment |
| npm | 9.0.0 or higher | Package manager |
| Git | 2.30.0 or higher | Version control (optional) |

### 1.2 Optional Software

| Software | Purpose |
|----------|---------|
| MongoDB | Production database (for future use) |
| VS Code | Recommended code editor |
| Postman | API testing tool |

### 1.3 System Requirements

**Minimum Requirements:**
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 500 MB free space
- **Network:** Internet connection for package installation

**Recommended Requirements:**
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 2 GB free space
- **Network:** Stable internet connection

---

## 2. System Requirements

### 2.1 Operating System Support

✅ **Supported Operating Systems:**
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)

### 2.2 Browser Requirements

**For Teachers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**For Students:**
- Mobile browsers with camera access
- Chrome Mobile 90+
- Safari Mobile 14+
- Firefox Mobile 88+

---

## 3. Installation Steps

### 3.1 Step 1: Install Node.js

#### Windows

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (18.x or higher)
3. Run the installer
4. Follow the installation wizard
5. Verify installation:

```bash
node --version
npm --version
```

#### macOS

**Using Homebrew:**
```bash
brew install node@18
```

**Or download from nodejs.org:**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download macOS installer
3. Run the installer
4. Verify installation

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Step 2: Clone or Download Project

#### Option A: Clone from Git Repository

```bash
git clone <repository-url>
cd attendRevolution
```

#### Option B: Download ZIP

1. Download project ZIP file
2. Extract to desired location
3. Navigate to project directory:

```bash
cd attendRevolution
```

### 3.3 Step 3: Install Dependencies

```bash
# Navigate to project root
cd attendRevolution

# Install all dependencies
npm install
```

**Expected Output:**
```
added 150 packages in 30s
```

### 3.4 Step 4: Create Data Directory

```bash
# Create data directory structure
mkdir -p server/data
mkdir -p reports/csv
mkdir -p reports/pdf
```

**Or on Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Path server\data
New-Item -ItemType Directory -Path reports\csv
New-Item -ItemType Directory -Path reports\pdf
```

### 3.5 Step 5: Initialize Data Files

Create initial data files:

**Create `server/data/sessions.json`:**
```json
[]
```

**Create `server/data/attendance.json`:**
```json
[]
```

**Or use command line:**

**Linux/macOS:**
```bash
echo "[]" > server/data/sessions.json
echo "[]" > server/data/attendance.json
```

**Windows (PowerShell):**
```powershell
Set-Content -Path server\data\sessions.json -Value "[]"
Set-Content -Path server\data\attendance.json -Value "[]"
```

---

## 4. Configuration

### 4.1 Environment Variables

Create a `.env` file in the project root:

```bash
# .env file

# Server Configuration
PORT=3000
NODE_ENV=development

# Application Settings
SESSION_DURATION_MIN=5
SESSION_DURATION_MAX=10
DEFAULT_SESSION_DURATION=5

# Data Storage
STORAGE_TYPE=json
DATA_DIR=./server/data

# Reports
REPORTS_DIR=./reports
CSV_DIR=./reports/csv
PDF_DIR=./reports/pdf

# CORS (for production)
ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 4.2 Configuration File

**File:** `server/config/config.js`

```javascript
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  session: {
    minDuration: parseInt(process.env.SESSION_DURATION_MIN) || 3,
    maxDuration: parseInt(process.env.SESSION_DURATION_MAX) || 10,
    defaultDuration: parseInt(process.env.DEFAULT_SESSION_DURATION) || 5
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'json',
    dataDir: process.env.DATA_DIR || './server/data'
  },
  reports: {
    csvDir: process.env.CSV_DIR || './reports/csv',
    pdfDir: process.env.PDF_DIR || './reports/pdf'
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  }
};
```

### 4.3 Package.json Scripts

Ensure `package.json` includes these scripts:

```json
{
  "scripts": {
    "start": "node server/app.js",
    "dev": "nodemon server/app.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## 5. Running the Application

### 5.1 Development Mode

**Start the server:**
```bash
npm run dev
```

**Or:**
```bash
npm start
```

**Expected Output:**
```
Server running on http://localhost:3000
Data storage: JSON files
Environment: development
```

### 5.2 Access the Application

**Teacher Interface:**
```
http://localhost:3000/teacher
```

**Student Interface:**
```
http://localhost:3000/student
```

**API Endpoint:**
```
http://localhost:3000/api
```

### 5.3 Stop the Server

Press `Ctrl + C` in the terminal to stop the server.

---

## 6. Verification

### 6.1 Verify Installation

**Check Node.js:**
```bash
node --version
# Should output: v18.x.x or higher
```

**Check npm:**
```bash
npm --version
# Should output: 9.x.x or higher
```

**Check Project Structure:**
```bash
# Verify directory structure
ls -la
# Should show: client/, server/, package.json, etc.
```

### 6.2 Test API Endpoints

**Using curl:**

**Test server health:**
```bash
curl http://localhost:3000/api/health
```

**Create a test session:**
```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "class": "TEST-101",
    "subject": "Test Subject",
    "section": "A",
    "duration": 5
  }'
```

**Using Postman:**

1. Import API collection (if available)
2. Test each endpoint
3. Verify responses

### 6.3 Test User Interfaces

**Teacher Interface:**
1. Open `http://localhost:3000/teacher`
2. Verify page loads correctly
3. Test session creation
4. Verify QR code generation

**Student Interface:**
1. Open `http://localhost:3000/student`
2. Verify page loads correctly
3. Test QR code scanning (if camera available)
4. Test manual entry

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Issue: Node.js not found

**Error:**
```
'node' is not recognized as an internal or external command
```

**Solution:**
1. Verify Node.js installation
2. Add Node.js to PATH environment variable
3. Restart terminal/command prompt

#### Issue: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Option 1: Change port in .env file
PORT=3001

# Option 2: Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

#### Issue: Module not found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Permission denied

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Linux/macOS: Fix permissions
sudo chown -R $USER:$USER .

# Or run with appropriate permissions
```

#### Issue: Data files not found

**Error:**
```
ENOENT: no such file or directory
```

**Solution:**
```bash
# Create data directory and files
mkdir -p server/data
echo "[]" > server/data/sessions.json
echo "[]" > server/data/attendance.json
```

### 7.2 Debug Mode

**Enable debug logging:**
```bash
# Set log level
export LOG_LEVEL=debug

# Or in .env file
LOG_LEVEL=debug
```

**Check logs:**
```bash
# View log file
tail -f logs/app.log
```

### 7.3 Getting Help

**Check Logs:**
- Application logs: `logs/app.log`
- Console output: Terminal where server is running

**Verify Configuration:**
- Check `.env` file
- Verify `server/config/config.js`
- Check file permissions

**Test Connectivity:**
```bash
# Test server response
curl http://localhost:3000/api/health

# Test specific endpoint
curl http://localhost:3000/api/session/active
```

---

## 8. Development Setup

### 8.1 Development Dependencies

**Install development tools:**
```bash
npm install --save-dev nodemon eslint jest
```

### 8.2 Code Editor Setup

**VS Code Extensions:**
- ESLint
- Prettier
- Node.js Extension Pack
- REST Client

**VS Code Settings (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript"],
  "files.exclude": {
    "**/node_modules": true
  }
}
```

### 8.3 Git Setup

**Initialize Git (if not already):**
```bash
git init
git add .
git commit -m "Initial commit"
```

**Create `.gitignore`:**
```
node_modules/
.env
logs/
*.log
reports/
server/data/*.json
.DS_Store
```

### 8.4 Testing Setup

**Run tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm test -- --coverage
```

---

## 9. Production Deployment

### 9.1 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS settings
- [ ] Set up HTTPS/SSL
- [ ] Configure logging
- [ ] Set up process manager (PM2)
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Configure firewall rules

### 9.2 Using PM2 (Process Manager)

**Install PM2:**
```bash
npm install -g pm2
```

**Start application:**
```bash
pm2 start server/app.js --name attendance-system
```

**PM2 Commands:**
```bash
# View status
pm2 status

# View logs
pm2 logs attendance-system

# Restart
pm2 restart attendance-system

# Stop
pm2 stop attendance-system

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### 9.3 Environment Configuration

**Production `.env`:**
```bash
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=info
STORAGE_TYPE=json
```

### 9.4 Reverse Proxy (NGINX)

**NGINX Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.5 SSL/HTTPS Setup

**Using Let's Encrypt:**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 10. Backup and Maintenance

### 10.1 Backup Strategy

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DATA_DIR="./server/data"

mkdir -p $BACKUP_DIR

# Backup data files
cp $DATA_DIR/sessions.json $BACKUP_DIR/sessions_$DATE.json
cp $DATA_DIR/attendance.json $BACKUP_DIR/attendance_$DATE.json

# Keep only last 30 days
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Schedule with Cron:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### 10.2 Maintenance Tasks

**Daily:**
- Check server logs
- Verify backups
- Monitor disk space

**Weekly:**
- Review error logs
- Check data integrity
- Update dependencies (if needed)

**Monthly:**
- Archive old data
- Review performance metrics
- Update documentation

---

## 11. Uninstallation

### 11.1 Remove Application

**Stop the server:**
```bash
# If using PM2
pm2 stop attendance-system
pm2 delete attendance-system

# Or stop manually
# Press Ctrl+C in terminal
```

**Remove files:**
```bash
# Remove project directory
rm -rf attendRevolution

# Or on Windows
rmdir /s attendRevolution
```

**Remove global packages (if installed):**
```bash
npm uninstall -g pm2
```

### 11.2 Clean Up Data

**Backup before removal:**
```bash
# Backup data files
cp -r server/data backups/
```

**Remove data:**
```bash
rm -rf server/data/*
rm -rf reports/*
```

---

## 12. Quick Start Summary

**For Quick Setup:**

```bash
# 1. Install Node.js (if not installed)
# Visit nodejs.org

# 2. Clone/download project
cd attendRevolution

# 3. Install dependencies
npm install

# 4. Create data directories
mkdir -p server/data reports/csv reports/pdf

# 5. Initialize data files
echo "[]" > server/data/sessions.json
echo "[]" > server/data/attendance.json

# 6. Start server
npm start

# 7. Access application
# Teacher: http://localhost:3000/teacher
# Student: http://localhost:3000/student
```

---

## 13. Additional Resources

### 13.1 Documentation

- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### 13.2 Support

- Check logs: `logs/app.log`
- Review troubleshooting section
- Check GitHub issues (if applicable)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026 | Abdul Hakeem Shah | Initial setup guide |

---

**Document Status:** ✅ Approved  
**Review Date:** As needed  
**Distribution:** All Users, Development Team

