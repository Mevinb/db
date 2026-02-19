/**
 * Course Routes
 * CRUD endpoints for courses
 */

const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  assignFaculty
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getCourses);
router.get('/:id', validationRules.mongoId, validate, getCourse);
router.get('/:id/students', validationRules.mongoId, validate, getCourseStudents);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.course, validate, createCourse);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateCourse);
router.put('/:id/assign-faculty', authorize('admin'), validationRules.mongoId, validate, assignFaculty);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteCourse);

module.exports = router;
