// server/config/config.js

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
};


