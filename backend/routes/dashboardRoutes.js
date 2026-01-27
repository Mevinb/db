/**
 * Dashboard Routes
 * Endpoints for dashboard data
 */

const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Dashboard routes based on role
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/faculty', authorize('faculty'), getFacultyDashboard);
router.get('/student', authorize('student'), getStudentDashboard);

module.exports = router;
