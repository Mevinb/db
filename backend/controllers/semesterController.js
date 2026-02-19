/**
 * Semester Controller
 * CRUD operations for academic semesters
 */

const { Semester, Course, Enrollment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getSemesters = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, academicYear, status } = req.query;

  const where = {};
  if (academicYear) where.academicYear = academicYear;
  if (status) where.status = status;

  const { count: total, rows: semesters } = await Semester.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['startDate', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: semesters.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: semesters
  });
});

const getCurrentSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({ where: { isCurrent: true } });

  if (!semester) {
    return res.status(404).json({ success: false, message: 'No current semester set' });
  }

  res.status(200).json({ success: true, data: semester });
});

const getSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);

  if (!semester) {
    return res.status(404).json({ success: false, message: 'Semester not found' });
  }

  res.status(200).json({ success: true, data: semester });
});

const createSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Semester created successfully',
    data: semester
  });
});

const updateSemester = asyncHandler(async (req, res) => {
  let semester = await Semester.findByPk(req.params.id);

  if (!semester) {
    return res.status(404).json({ success: false, message: 'Semester not found' });
  }

  await semester.update(req.body);

  res.status(200).json({
    success: true,
    message: 'Semester updated successfully',
    data: semester
  });
});

const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);

  if (!semester) {
    return res.status(404).json({ success: false, message: 'Semester not found' });
  }

  const courseCount = await Course.count({ where: { semesterId: req.params.id } });
  const enrollmentCount = await Enrollment.count({ where: { semesterId: req.params.id } });

  if (courseCount > 0 || enrollmentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete semester. It has ${courseCount} courses and ${enrollmentCount} enrollments.`
    });
  }

  await semester.destroy();

  res.status(200).json({ success: true, message: 'Semester deleted successfully' });
});

const setCurrentSemester = asyncHandler(async (req, res) => {
  // Unset all current semesters
  await Semester.update({ isCurrent: false }, { where: {} });

  const semester = await Semester.findByPk(req.params.id);

  if (!semester) {
    return res.status(404).json({ success: false, message: 'Semester not found' });
  }

  await semester.update({ isCurrent: true, status: 'Ongoing' });

  res.status(200).json({
    success: true,
    message: 'Current semester set successfully',
    data: semester
  });
});

module.exports = {
  getSemesters,
  getCurrentSemester,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  setCurrentSemester
};
