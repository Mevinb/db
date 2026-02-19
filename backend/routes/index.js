/**
 * Routes Index
 * Central export for all routes
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const departmentRoutes = require('./departmentRoutes');
const programRoutes = require('./programRoutes');
const facultyRoutes = require('./facultyRoutes');
const studentRoutes = require('./studentRoutes');
const semesterRoutes = require('./semesterRoutes');
const courseRoutes = require('./courseRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const examRoutes = require('./examRoutes');
const markRoutes = require('./markRoutes');
const announcementRoutes = require('./announcementRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const logRoutes = require('./logRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/programs', programRoutes);
router.use('/faculty', facultyRoutes);
router.use('/students', studentRoutes);
router.use('/semesters', semesterRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/marks', markRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Management System API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
