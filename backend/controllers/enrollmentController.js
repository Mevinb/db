/**
 * Enrollment Controller
 * CRUD operations for course enrollments
 */

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all enrollments
 * @route   GET /api/enrollments
 * @access  Private
 */
const getEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, student, course, semester, status } = req.query;

  const query = {};
  if (student) query.student = student;
  if (course) query.course = course;
  if (semester) query.semester = semester;
  if (status) query.status = status;

  const total = await Enrollment.countDocuments(query);
  const enrollments = await Enrollment.find(query)
    .populate('student', 'name rollNumber email')
    .populate('course', 'name code credits')
    .populate('semester', 'name code academicYear')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: enrollments
  });
});

/**
 * @desc    Get single enrollment
 * @route   GET /api/enrollments/:id
 * @access  Private
 */
const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('student', 'name rollNumber email phone')
    .populate({
      path: 'course',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'faculty', select: 'name' }
      ]
    })
    .populate('semester', 'name code academicYear');

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

/**
 * @desc    Create enrollment
 * @route   POST /api/enrollments
 * @access  Private
 */
const createEnrollment = asyncHandler(async (req, res) => {
  const { student, course, semester } = req.body;

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student,
    course,
    semester
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: 'Student is already enrolled in this course for this semester'
    });
  }

  // Check course capacity
  const courseDoc = await Course.findById(course);
  if (courseDoc.currentEnrollment >= courseDoc.maxCapacity) {
    return res.status(400).json({
      success: false,
      message: 'Course has reached maximum capacity'
    });
  }

  const enrollment = await Enrollment.create(req.body);

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate('student', 'name rollNumber')
    .populate('course', 'name code')
    .populate('semester', 'name code');

  res.status(201).json({
    success: true,
    message: 'Enrollment created successfully',
    data: populatedEnrollment
  });
});

/**
 * @desc    Bulk enroll students
 * @route   POST /api/enrollments/bulk
 * @access  Private/Admin
 */
const bulkEnroll = asyncHandler(async (req, res) => {
  const { students, course, semester } = req.body;

  const results = {
    success: [],
    failed: []
  };

  for (const studentId of students) {
    try {
      // Check if already enrolled
      const existing = await Enrollment.findOne({
        student: studentId,
        course,
        semester
      });

      if (existing) {
        results.failed.push({
          student: studentId,
          reason: 'Already enrolled'
        });
        continue;
      }

      const enrollment = await Enrollment.create({
        student: studentId,
        course,
        semester
      });

      results.success.push(enrollment._id);
    } catch (error) {
      results.failed.push({
        student: studentId,
        reason: error.message
      });
    }
  }

  res.status(201).json({
    success: true,
    message: `Enrolled ${results.success.length} students, ${results.failed.length} failed`,
    data: results
  });
});

/**
 * @desc    Update enrollment
 * @route   PUT /api/enrollments/:id
 * @access  Private
 */
const updateEnrollment = asyncHandler(async (req, res) => {
  let enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  // If grade is being set, calculate grade points
  if (req.body.grade) {
    const gradePointMap = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7,
      'C+': 6, 'C': 5, 'D': 4, 'F': 0,
      'I': 0, 'W': 0
    };
    req.body.gradePoints = gradePointMap[req.body.grade] || 0;
  }

  enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('student', 'name rollNumber')
    .populate('course', 'name code')
    .populate('semester', 'name code');

  res.status(200).json({
    success: true,
    message: 'Enrollment updated successfully',
    data: enrollment
  });
});

/**
 * @desc    Delete enrollment
 * @route   DELETE /api/enrollments/:id
 * @access  Private/Admin
 */
const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  await enrollment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Enrollment deleted successfully'
  });
});

/**
 * @desc    Get enrollment by student and course
 * @route   GET /api/enrollments/student/:studentId/course/:courseId
 * @access  Private
 */
const getEnrollmentByStudentCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.params.studentId,
    course: req.params.courseId,
    status: 'Enrolled'
  })
    .populate('student', 'name rollNumber')
    .populate('course', 'name code credits');

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  res.status(200).json({
    success: true,
    data: enrollment
  });
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
