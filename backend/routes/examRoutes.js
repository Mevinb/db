/**
 * Exam Routes
 * CRUD endpoints for exams
 */

const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamsByCourse,
  publishExamResults
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getExams);
router.get('/course/:courseId', getExamsByCourse);
router.get('/:id', validationRules.mongoId, validate, getExam);

// POST, PUT, DELETE - Admin and Faculty
router.post('/', authorize('admin', 'faculty'), validationRules.exam, validate, createExam);
router.put('/:id', authorize('admin', 'faculty'), validationRules.mongoId, validate, updateExam);
router.put('/:id/publish', authorize('admin', 'faculty'), validationRules.mongoId, validate, publishExamResults);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteExam);

module.exports = router;
