/**
 * Semester Controller
 * CRUD operations for academic semesters
 */

const Semester = require('../models/Semester');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all semesters
 * @route   GET /api/semesters
 * @access  Private
 */
const getSemesters = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, academicYear, status } = req.query;

  const query = {};
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = status;

  const total = await Semester.countDocuments(query);
  const semesters = await Semester.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    count: semesters.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: semesters
  });
});

/**
 * @desc    Get current semester
 * @route   GET /api/semesters/current
 * @access  Private
 */
const getCurrentSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({ isCurrent: true });

  if (!semester) {
    return res.status(404).json({
      success: false,
      message: 'No current semester set'
    });
  }

  res.status(200).json({
    success: true,
    data: semester
  });
});

/**
 * @desc    Get single semester
 * @route   GET /api/semesters/:id
 * @access  Private
 */
const getSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    return res.status(404).json({
      success: false,
      message: 'Semester not found'
    });
  }

  res.status(200).json({
    success: true,
    data: semester
  });
});

/**
 * @desc    Create semester
 * @route   POST /api/semesters
 * @access  Private/Admin
 */
const createSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Semester created successfully',
    data: semester
  });
});

/**
 * @desc    Update semester
 * @route   PUT /api/semesters/:id
 * @access  Private/Admin
 */
const updateSemester = asyncHandler(async (req, res) => {
  let semester = await Semester.findById(req.params.id);

  if (!semester) {
    return res.status(404).json({
      success: false,
      message: 'Semester not found'
    });
  }

  semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Semester updated successfully',
    data: semester
  });
});

/**
 * @desc    Delete semester
 * @route   DELETE /api/semesters/:id
 * @access  Private/Admin
 */
const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    return res.status(404).json({
      success: false,
      message: 'Semester not found'
    });
  }

  // Check for dependent records
  const Course = require('../models/Course');
  const Enrollment = require('../models/Enrollment');

  const courseCount = await Course.countDocuments({ semester: req.params.id });
  const enrollmentCount = await Enrollment.countDocuments({ semester: req.params.id });

  if (courseCount > 0 || enrollmentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete semester. It has ${courseCount} courses and ${enrollmentCount} enrollments.`
    });
  }

  await semester.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Semester deleted successfully'
  });
});

/**
 * @desc    Set current semester
 * @route   PUT /api/semesters/:id/set-current
 * @access  Private/Admin
 */
const setCurrentSemester = asyncHandler(async (req, res) => {
  // Unset all current semesters
  await Semester.updateMany({}, { isCurrent: false });

  // Set the specified semester as current
  const semester = await Semester.findByIdAndUpdate(
    req.params.id,
    { isCurrent: true, status: 'Ongoing' },
    { new: true }
  );

  if (!semester) {
    return res.status(404).json({
      success: false,
      message: 'Semester not found'
    });
  }

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
