/**
 * Enrollment Controller
 * CRUD operations for student enrollments
 */

const { Op } = require('sequelize');
const { Enrollment, Student, Course, Semester, Faculty, Program } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, student, course, semester, status } = req.query;

  const where = {};
  if (student) where.studentId = student;
  if (course) where.courseId = course;
  if (semester) where.semesterId = semester;
  if (status) where.status = status;

  const { count: total, rows: enrollments } = await Enrollment.findAndCountAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'email'] },
      {
        model: Course, as: 'course', attributes: ['name', 'code', 'credits'],
        include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: enrollments
  });
});

const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findByPk(req.params.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'email'] },
      {
        model: Course, as: 'course', attributes: ['name', 'code', 'credits'],
        include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] }
    ]
  });

  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  res.status(200).json({ success: true, data: enrollment });
});

const createEnrollment = asyncHandler(async (req, res) => {
  // Check for existing enrollment
  const existing = await Enrollment.findOne({
    where: {
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      semesterId: req.body.semesterId
    }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Student is already enrolled in this course for this semester'
    });
  }

  const enrollment = await Enrollment.create(req.body);

  const populatedEnrollment = await Enrollment.findByPk(enrollment.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Enrollment created successfully',
    data: populatedEnrollment
  });
});

const bulkEnroll = asyncHandler(async (req, res) => {
  const { studentIds, courseId, semesterId } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of student IDs'
    });
  }

  const results = { successful: [], failed: [] };

  for (const studentId of studentIds) {
    try {
      const existing = await Enrollment.findOne({
        where: { studentId, courseId, semesterId }
      });

      if (existing) {
        results.failed.push({ studentId, reason: 'Already enrolled' });
        continue;
      }

      const enrollment = await Enrollment.create({ studentId, courseId, semesterId });
      results.successful.push(enrollment);
    } catch (error) {
      results.failed.push({ studentId, reason: error.message });
    }
  }

  res.status(201).json({
    success: true,
    message: `Enrolled ${results.successful.length} students. ${results.failed.length} failed.`,
    data: results
  });
});

const updateEnrollment = asyncHandler(async (req, res) => {
  let enrollment = await Enrollment.findByPk(req.params.id);

  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  await enrollment.update(req.body);

  enrollment = await Enrollment.findByPk(req.params.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Enrollment updated successfully',
    data: enrollment
  });
});

const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findByPk(req.params.id);

  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  await enrollment.destroy();

  res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
});

const getEnrollmentByStudentCourse = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.params;

  const enrollment = await Enrollment.findOne({
    where: { studentId, courseId },
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code', 'credits'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ]
  });

  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }

  res.status(200).json({ success: true, data: enrollment });
});

module.exports = {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  bulkEnroll,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentByStudentCourse
};
