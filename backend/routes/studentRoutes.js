/**
 * Student Routes
 * CRUD endpoints for students
 */

const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByProgram,
  getStudentEnrollments,
  getStudentAttendance,
  getStudentMarks
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getStudents);
router.get('/program/:programId', getStudentsByProgram);
router.get('/:id', validationRules.mongoId, validate, getStudent);
router.get('/:id/enrollments', validationRules.mongoId, validate, getStudentEnrollments);
router.get('/:id/attendance', validationRules.mongoId, validate, getStudentAttendance);
router.get('/:id/marks', validationRules.mongoId, validate, getStudentMarks);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.student, validate, createStudent);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateStudent);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteStudent);

module.exports = router;
