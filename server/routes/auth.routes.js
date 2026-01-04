// server/routes/auth.routes.js

const express = require('express');
const router = express.Router();

// The routes for user registration and login have been removed.
// This is because the new system does not use student accounts or JWT-based login.
// Teachers are now authenticated via a pre-shared teacherId.
// This file is kept to prevent breaking the main application's route mounting,
// but it no longer contains active endpoints.

module.exports = router;
