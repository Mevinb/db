/**
 * Attendance Routes
 * CRUD endpoints for attendance management
 */

const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getCourseAttendance,
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
  getCourseAttendanceSummary,
  getStudentAttendanceSummary
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getAttendance);
router.get('/course/:courseId/date/:date', getCourseAttendance);
router.get('/summary/course/:courseId', getCourseAttendanceSummary);
router.get('/summary/student/:studentId', getStudentAttendanceSummary);

// POST routes - Faculty and Admin
router.post('/', authorize('admin', 'faculty'), validationRules.attendance, validate, markAttendance);
router.post('/bulk', authorize('admin', 'faculty'), validationRules.bulkAttendance, validate, markBulkAttendance);

// PUT, DELETE
router.put('/:id', authorize('admin', 'faculty'), validationRules.mongoId, validate, updateAttendance);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteAttendance);

module.exports = router;
