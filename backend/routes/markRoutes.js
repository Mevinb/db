/**
 * Mark Routes
 * CRUD endpoints for marks/grades
 */

const express = require('express');
const router = express.Router();
const {
  getMarks,
  getExamMarks,
  enterMark,
  enterBulkMarks,
  updateMark,
  deleteMark,
  getStudentGradesSummary
} = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getMarks);
router.get('/exam/:examId', getExamMarks);
router.get('/student/:studentId/summary', getStudentGradesSummary);

// POST routes - Faculty and Admin
router.post('/', authorize('admin', 'faculty'), validationRules.mark, validate, enterMark);
router.post('/bulk', authorize('admin', 'faculty'), validationRules.bulkMarks, validate, enterBulkMarks);

// PUT, DELETE
router.put('/:id', authorize('admin', 'faculty'), validationRules.mongoId, validate, updateMark);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteMark);

module.exports = router;
