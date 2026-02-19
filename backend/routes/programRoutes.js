/**
 * Program Routes
 * CRUD endpoints for academic programs
 */

const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramsByDepartment
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getPrograms);
router.get('/department/:departmentId', getProgramsByDepartment);
router.get('/:id', validationRules.mongoId, validate, getProgram);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.program, validate, createProgram);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateProgram);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteProgram);

module.exports = router;
