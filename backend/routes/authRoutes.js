/**
 * Authentication Routes
 * Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// Public routes
router.post('/register', validationRules.register, validate, register);
router.post('/login', validationRules.login, validate, login);

// Protected routes (all authenticated users)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Admin only routes
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), validationRules.mongoId, validate, updateUser);
router.delete('/users/:id', protect, authorize('admin'), validationRules.mongoId, validate, deleteUser);

module.exports = router;
