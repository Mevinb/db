/**
 * Student Controller
 * CRUD operations for students
 */

const Student = require('../models/Student');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, program, semester, status } = req.query;

  const query = {};
  if (department) query.department = department;
  if (program) query.program = program;
  if (semester) query.currentSemester = parseInt(semester);
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('department', 'name code')
    .populate('program', 'name code')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ rollNumber: 1 });

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: students
  });
});

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('department', 'name code')
    .populate('program', 'name code degreeType');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Create student with user account
 * @route   POST /api/students
 * @access  Private/Admin
 */
const createStudent = asyncHandler(async (req, res) => {
  const { email, password = 'Student@123', ...studentData } = req.body;

  // Check if roll number or email already exists
  const existingStudent = await Student.findOne({
    $or: [{ email }, { rollNumber: studentData.rollNumber }]
  });
  if (existingStudent) {
    return res.status(400).json({
      success: false,
      message: 'Student with this email or roll number already exists'
    });
  }

  // Create student record
  const student = await Student.create({ email, ...studentData });

  // Create user account for student
  const user = await User.create({
    email,
    password,
    name: studentData.name,
    role: 'student',
    profileId: student._id,
    profileModel: 'Student'
  });

  // Link user to student
  student.user = user._id;
  await student.save();

  const populatedStudent = await Student.findById(student._id)
    .populate('department', 'name code')
    .populate('program', 'name code');

  res.status(201).json({
    success: true,
    message: 'Student created successfully with login credentials',
    data: populatedStudent
  });
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private/Admin
 */
const updateStudent = asyncHandler(async (req, res) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Check for duplicate email/roll number if being changed
  if (req.body.email && req.body.email !== student.email) {
    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }
    // Update user email
    if (student.user) {
      await User.findByIdAndUpdate(student.user, {
        email: req.body.email,
        name: req.body.name || student.name
      });
    }
  }

  if (req.body.rollNumber && req.body.rollNumber !== student.rollNumber) {
    const existingStudent = await Student.findOne({ rollNumber: req.body.rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is already in use'
      });
    }
  }

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('department', 'name code')
    .populate('program', 'name code');

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Check for dependent records
  const Enrollment = require('../models/Enrollment');
  const enrollmentCount = await Enrollment.countDocuments({ student: req.params.id });

  if (enrollmentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete student. They have ${enrollmentCount} course enrollments. Consider marking as inactive instead.`
    });
  }

  // Delete associated user account
  if (student.user) {
    await User.findByIdAndDelete(student.user);
  }

  await student.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
});

/**
 * @desc    Get students by program
 * @route   GET /api/students/program/:programId
 * @access  Private
 */
const getStudentsByProgram = asyncHandler(async (req, res) => {
  const { semester } = req.query;
  
  const query = {
    program: req.params.programId,
    status: 'Active'
  };
  
  if (semester) {
    query.currentSemester = parseInt(semester);
  }

  const students = await Student.find(query)
    .populate('department', 'name code')
    .sort({ rollNumber: 1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

/**
 * @desc    Get student enrollments
 * @route   GET /api/students/:id/enrollments
 * @access  Private
 */
const getStudentEnrollments = asyncHandler(async (req, res) => {
  const Enrollment = require('../models/Enrollment');
  
  const enrollments = await Enrollment.find({ student: req.params.id })
    .populate({
      path: 'course',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'faculty', select: 'name' }
      ]
    })
    .populate('semester', 'name code academicYear')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

/**
 * @desc    Get student attendance summary
 * @route   GET /api/students/:id/attendance
 * @access  Private
 */
const getStudentAttendance = asyncHandler(async (req, res) => {
  const Enrollment = require('../models/Enrollment');
  const Attendance = require('../models/Attendance');
  
  const enrollments = await Enrollment.find({
    student: req.params.id,
    status: 'Enrolled'
  }).populate('course', 'name code');

  const attendanceSummary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const total = await Attendance.countDocuments({
        student: req.params.id,
        course: enrollment.course._id
      });
      const present = await Attendance.countDocuments({
        student: req.params.id,
        course: enrollment.course._id,
        status: { $in: ['Present', 'Late'] }
      });

      return {
        course: enrollment.course,
        totalClasses: total,
        attended: present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    data: attendanceSummary
  });
});

/**
 * @desc    Get student marks
 * @route   GET /api/students/:id/marks
 * @access  Private
 */
const getStudentMarks = asyncHandler(async (req, res) => {
  const Mark = require('../models/Mark');
  
  const marks = await Mark.find({
    student: req.params.id,
    isPublished: true
  })
    .populate('course', 'name code credits')
    .populate('exam', 'name type category maxMarks')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: marks.length,
    data: marks
  });
});

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByProgram,
  getStudentEnrollments,
  getStudentAttendance,
  getStudentMarks
};
