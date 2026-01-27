/**
 * Department Routes
 * CRUD endpoints for departments
 */

const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes - accessible by all authenticated users
router.get('/', getDepartments);
router.get('/:id', validationRules.mongoId, validate, getDepartment);
router.get('/:id/stats', validationRules.mongoId, validate, getDepartmentStats);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.department, validate, createDepartment);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateDepartment);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteDepartment);

module.exports = router;
