/**
 * Announcement Routes
 * CRUD endpoints for announcements
 */

const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET routes
router.get('/', getAnnouncements);
router.get('/active', getActiveAnnouncements);
router.get('/:id', validationRules.mongoId, validate, getAnnouncement);

// POST, PUT, DELETE - Admin only
router.post('/', authorize('admin'), validationRules.announcement, validate, createAnnouncement);
router.put('/:id', authorize('admin'), validationRules.mongoId, validate, updateAnnouncement);
router.put('/:id/toggle-pin', authorize('admin'), validationRules.mongoId, validate, togglePin);
router.delete('/:id', authorize('admin'), validationRules.mongoId, validate, deleteAnnouncement);

module.exports = router;
