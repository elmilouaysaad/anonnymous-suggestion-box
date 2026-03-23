require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');
const logger = require('./utils/logger');
require('./models');

// Import routes
const publicRoutes = require('./routes/public');
const departmentRoutes = require('./routes/department');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const corsMiddleware = require('./middleware/cors');

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1';
let dbReadyPromise = null;

const ensureDatabaseReady = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = sequelize.authenticate().then(() => {
      logger.info('✓ Database connection successful');
      logger.info('✓ Database models synced');
      return true;
    });
  }

  return dbReadyPromise;
};

// ============ MIDDLEWARE ============

// Logging
app.use(morgan('combined'));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(corsMiddleware);

// Request ID for logging
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  logger.info(`[${req.id}] ${req.method} ${req.path}`);
  next();
});

// Ensure DB is initialized for serverless runtime before routes execute.
if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await ensureDatabaseReady();
      next();
    } catch (error) {
      next(error);
    }
  });
}

// ============ ROUTES ============

// Health check
app.use('/health', healthRoutes);

// Public API (no authentication required)
app.use('/api/public', publicRoutes);

// Department API (department authentication required)
app.use('/api/department', departmentRoutes);

// Admin API (admin authentication required)
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// ============ ERROR HANDLING ============
app.use(errorHandler);

// ============ DATABASE & SERVER START ============

const startServer = async () => {
  try {
    await ensureDatabaseReady();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV}`);
      logger.info(`✓ API URL: ${process.env.API_URL}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server only for local/traditional runtimes.
if (!isVercel) {
  startServer();
}

module.exports = app;
