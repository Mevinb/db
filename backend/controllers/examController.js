/**
 * Exam Controller
 * CRUD operations for exams
 */

const Exam = require('../models/Exam');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all exams
 * @route   GET /api/exams
 * @access  Private
 */
const getExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, course, semester, type, category, status } = req.query;

  const query = {};
  if (course) query.course = course;
  if (semester) query.semester = semester;
  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;

  const total = await Exam.countDocuments(query);
  const exams = await Exam.find(query)
    .populate('course', 'name code')
    .populate('semester', 'name code')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: exams.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: exams
  });
});

/**
 * @desc    Get single exam
 * @route   GET /api/exams/:id
 * @access  Private
 */
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('course', 'name code')
    .populate('semester', 'name code academicYear');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

/**
 * @desc    Create exam
 * @route   POST /api/exams
 * @access  Private/Admin/Faculty
 */
const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);

  const populatedExam = await Exam.findById(exam._id)
    .populate('course', 'name code')
    .populate('semester', 'name code');

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: populatedExam
  });
});

/**
 * @desc    Update exam
 * @route   PUT /api/exams/:id
 * @access  Private/Admin/Faculty
 */
const updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('course', 'name code')
    .populate('semester', 'name code');

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: exam
  });
});

/**
 * @desc    Delete exam
 * @route   DELETE /api/exams/:id
 * @access  Private/Admin
 */
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Check for marks
  const Mark = require('../models/Mark');
  const markCount = await Mark.countDocuments({ exam: req.params.id });

  if (markCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete exam. It has ${markCount} mark records.`
    });
  }

  await exam.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

/**
 * @desc    Get exams for a course
 * @route   GET /api/exams/course/:courseId
 * @access  Private
 */
const getExamsByCourse = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ course: req.params.courseId })
    .populate('semester', 'name code')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams
  });
});

/**
 * @desc    Publish exam results
 * @route   PUT /api/exams/:id/publish
 * @access  Private/Faculty
 */
const publishExamResults = asyncHandler(async (req, res) => {
  const Mark = require('../models/Mark');

  // Update exam status
  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    { isPublished: true, status: 'Completed' },
    { new: true }
  );

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Publish all marks for this exam
  await Mark.updateMany(
    { exam: req.params.id },
    { isPublished: true }
  );

  res.status(200).json({
    success: true,
    message: 'Exam results published successfully',
    data: exam
  });
});

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamsByCourse,
  publishExamResults
};
