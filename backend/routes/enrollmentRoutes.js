/**
 * Enrollment Routes
 * CRUD endpoints for course enrollments
 */

const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  bulkEnroll,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentByStudentCourse
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getEnrollments);
router.get('/:id', validationRules.mongoId, validate, getEnrollment);
router.get('/student/:studentId/course/:courseId', getEnrollmentByStudentCourse);

// POST routes
router.post('/', authorize('admin', 'faculty'), validationRules.enrollment, validate, createEnrollment);
router.post('/bulk', authorize('admin'), bulkEnroll);

// PUT, DELETE - Admin/Faculty
router.put('/:id', authorize('admin', 'faculty'), validationRules.mongoId, validate, updateEnrollment);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteEnrollment);

module.exports = router;
