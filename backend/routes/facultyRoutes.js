/**
 * Faculty Routes
 * CRUD endpoints for faculty members
 */

const express = require('express');
const router = express.Router();
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyByDepartment,
  getFacultyCourses
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getFaculty);
router.get('/department/:departmentId', getFacultyByDepartment);
router.get('/:id', validationRules.mongoId, validate, getFacultyById);
router.get('/:id/courses', validationRules.mongoId, validate, getFacultyCourses);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.faculty, validate, createFaculty);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateFaculty);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteFaculty);

module.exports = router;
