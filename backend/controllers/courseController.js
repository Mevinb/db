/**
 * Course Controller
 * CRUD operations for courses
 */

const Course = require('../models/Course');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private
 */
const getCourses = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    department, 
    program, 
    semester,
    faculty,
    type,
    semesterNumber,
    isActive 
  } = req.query;

  const query = {};
  if (department) query.department = department;
  if (program) query.program = program;
  if (semester) query.semester = semester;
  if (faculty) query.faculty = faculty;
  if (type) query.type = type;
  if (semesterNumber) query.semesterNumber = parseInt(semesterNumber);
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code academicYear')
    .populate('faculty', 'name employeeId')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ code: 1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: courses
  });
});

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Private
 */
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code academicYear')
    .populate('faculty', 'name employeeId email');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);

  const populatedCourse = await Course.findById(course._id)
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code')
    .populate('faculty', 'name employeeId');

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: populatedCourse
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code')
    .populate('faculty', 'name employeeId');

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check for dependent records
  const Enrollment = require('../models/Enrollment');
  const Exam = require('../models/Exam');

  const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id });
  const examCount = await Exam.countDocuments({ course: req.params.id });

  if (enrollmentCount > 0 || examCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete course. It has ${enrollmentCount} enrollments and ${examCount} exams.`
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

/**
 * @desc    Get enrolled students for a course
 * @route   GET /api/courses/:id/students
 * @access  Private
 */
const getCourseStudents = asyncHandler(async (req, res) => {
  const Enrollment = require('../models/Enrollment');
  
  const enrollments = await Enrollment.find({
    course: req.params.id,
    status: 'Enrolled'
  })
    .populate({
      path: 'student',
      select: 'name rollNumber email currentSemester'
    })
    .sort({ 'student.rollNumber': 1 });

  const students = enrollments.map(e => ({
    ...e.student.toObject(),
    enrollmentId: e._id,
    attendancePercentage: e.attendancePercentage,
    internalMarks: e.internalMarks,
    externalMarks: e.externalMarks,
    totalMarks: e.totalMarks,
    grade: e.grade
  }));

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

/**
 * @desc    Assign faculty to course
 * @route   PUT /api/courses/:id/assign-faculty
 * @access  Private/Admin
 */
const assignFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { faculty: facultyId },
    { new: true }
  )
    .populate('faculty', 'name employeeId email');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Faculty assigned successfully',
    data: course
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  assignFaculty
};
