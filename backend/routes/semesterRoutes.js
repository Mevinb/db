/**
 * Semester Routes
 * CRUD endpoints for academic semesters
 */

const express = require('express');
const router = express.Router();
const {
  getSemesters,
  getCurrentSemester,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  setCurrentSemester
} = require('../controllers/semesterController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getSemesters);
router.get('/current', getCurrentSemester);
router.get('/:id', validationRules.mongoId, validate, getSemester);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.semester, validate, createSemester);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateSemester);
router.put('/:id/set-current', authorize('admin'), validationRules.mongoId, validate, setCurrentSemester);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteSemester);

module.exports = router;
