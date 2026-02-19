/**
 * College Management System - Backend Server
 * 
 * Main entry point for the Express.js application
 * Connects to PostgreSQL and sets up all routes and middleware
 * 
 * @author DBMS Project Team
 * @version 1.0.0
 */

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logCapture');

// Initialize Express app
const app = express();

// Connect to PostgreSQL and sync models
connectDB();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Capture server logs for admin notification panel
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to College Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      departments: '/api/departments',
      programs: '/api/programs',
      faculty: '/api/faculty',
      students: '/api/students',
      semesters: '/api/semesters',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      attendance: '/api/attendance',
      exams: '/api/exams',
      marks: '/api/marks',
      announcements: '/api/announcements',
      dashboard: '/api/dashboard'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 College Management System - Backend Server           ║
║                                                           ║
║   Server running in ${process.env.NODE_ENV || 'development'} mode                      ║
║   Port: ${PORT}                                              ║
║   API URL: http://localhost:${PORT}/api                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
