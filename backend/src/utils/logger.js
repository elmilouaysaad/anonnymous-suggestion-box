const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    // Serverless runtimes can have read-only filesystems; console logging still works.
  }
}

const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = LOG_LEVEL[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'];

const logger = {
  debug: (message, data) => {
    if (currentLevel <= LOG_LEVEL.DEBUG) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [DEBUG] ${message}`;
      console.log(logMessage, data || '');
    }
  },

  info: (message, data) => {
    if (currentLevel <= LOG_LEVEL.INFO) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [INFO] ${message}`;
      console.log(logMessage, data || '');
    }
  },

  warn: (message, data) => {
    if (currentLevel <= LOG_LEVEL.WARN) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [WARN] ${message}`;
      console.warn(logMessage, data || '');
    }
  },

  error: (message, error) => {
    if (currentLevel <= LOG_LEVEL.ERROR) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [ERROR] ${message}`;
      console.error(logMessage);
      if (error) {
        console.error(error.stack || error);
      }
    }
  }
};

module.exports = logger;
