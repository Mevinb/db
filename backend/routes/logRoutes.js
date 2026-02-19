/**
 * Server Logs Routes
 * Provides admin-only endpoints to retrieve server-side logs
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getLogs, clearLogs } = require('../middleware/logCapture');

/**
 * @desc    Get server logs
 * @route   GET /api/logs
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), (req, res) => {
  const { level, limit, since } = req.query;
  const entries = getLogs({
    level,
    limit: limit ? parseInt(limit, 10) : 50,
    since,
  });

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

/**
 * @desc    Clear server logs
 * @route   DELETE /api/logs
 * @access  Private/Admin
 */
router.delete('/', protect, authorize('admin'), (req, res) => {
  clearLogs();
  res.status(200).json({
    success: true,
    message: 'Logs cleared',
  });
});

module.exports = router;
