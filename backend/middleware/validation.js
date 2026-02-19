/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // Auth validations
  register: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['admin', 'faculty', 'student']).withMessage('Invalid role')
  ],

  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Department validations
  department: [
    body('name').trim().notEmpty().withMessage('Department name is required'),
    body('code').trim().notEmpty().withMessage('Department code is required')
      .isLength({ max: 10 }).withMessage('Code cannot exceed 10 characters')
  ],

  // Program validations
  program: [
    body('name').trim().notEmpty().withMessage('Program name is required'),
    body('code').trim().notEmpty().withMessage('Program code is required'),
    body('departmentId').isInt().withMessage('Valid department ID is required'),
    body('duration').isInt({ min: 1, max: 6 }).withMessage('Duration must be between 1 and 6 years'),
    body('degreeType').isIn(['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'])
      .withMessage('Invalid degree type'),
    body('totalCredits').isInt({ min: 0 }).withMessage('Total credits must be a positive number'),
    body('totalSemesters').isInt({ min: 1 }).withMessage('Total semesters must be at least 1')
  ],

  // Faculty validations
  faculty: [
    body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('departmentId').isInt().withMessage('Valid department ID is required'),
    body('designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'])
      .withMessage('Invalid designation'),
    body('dateOfJoining').isISO8601().withMessage('Valid date of joining is required')
  ],

  // Student validations
  student: [
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('programId').isInt().withMessage('Valid program ID is required'),
    body('departmentId').isInt().withMessage('Valid department ID is required'),
    body('currentSemester').isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
    body('admissionYear').isInt({ min: 2000 }).withMessage('Valid admission year is required')
  ],

  // Semester validations
  semester: [
    body('name').trim().notEmpty().withMessage('Semester name is required'),
    body('code').trim().notEmpty().withMessage('Semester code is required'),
    body('academicYear').matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
    body('semesterNumber').isIn([1, 2]).withMessage('Semester number must be 1 or 2'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
  ],

  // Course validations
  course: [
    body('name').trim().notEmpty().withMessage('Course name is required'),
    body('code').trim().notEmpty().withMessage('Course code is required'),
    body('departmentId').isInt().withMessage('Valid department ID is required'),
    body('programId').isInt().withMessage('Valid program ID is required'),
    body('semesterId').isInt().withMessage('Valid semester ID is required'),
    body('semesterNumber').isInt({ min: 1 }).withMessage('Semester number must be at least 1'),
    body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('type').isIn(['Core', 'Elective', 'Lab', 'Project', 'Seminar']).withMessage('Invalid course type')
  ],

  // Enrollment validations
  enrollment: [
    body('studentId').isInt().withMessage('Valid student ID is required'),
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('semesterId').isInt().withMessage('Valid semester ID is required')
  ],

  // Attendance validations
  attendance: [
    body('studentId').isInt().withMessage('Valid student ID is required'),
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('status').isIn(['Present', 'Absent', 'Late', 'Excused']).withMessage('Invalid status')
  ],

  // Bulk attendance
  bulkAttendance: [
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('records').isArray({ min: 1 }).withMessage('At least one attendance record is required'),
    body('records.*.studentId').isInt().withMessage('Valid student ID is required'),
    body('records.*.status').isIn(['Present', 'Absent', 'Late', 'Excused']).withMessage('Invalid status')
  ],

  // Exam validations
  exam: [
    body('name').trim().notEmpty().withMessage('Exam name is required'),
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('semesterId').isInt().withMessage('Valid semester ID is required'),
    body('type').isIn(['Quiz', 'Assignment', 'Mid-Term', 'End-Term', 'Lab', 'Project', 'Viva', 'Practical'])
      .withMessage('Invalid exam type'),
    body('category').isIn(['Internal', 'External']).withMessage('Invalid category'),
    body('maxMarks').isInt({ min: 1 }).withMessage('Maximum marks must be at least 1'),
    body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks cannot be negative')
  ],

  // Mark validations
  mark: [
    body('studentId').isInt().withMessage('Valid student ID is required'),
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('examId').isInt().withMessage('Valid exam ID is required'),
    body('marksObtained').isFloat({ min: 0 }).withMessage('Marks cannot be negative'),
    body('maxMarks').isFloat({ min: 1 }).withMessage('Maximum marks must be at least 1')
  ],

  // Bulk marks
  bulkMarks: [
    body('examId').isInt().withMessage('Valid exam ID is required'),
    body('courseId').isInt().withMessage('Valid course ID is required'),
    body('marks').isArray({ min: 1 }).withMessage('At least one mark record is required'),
    body('marks.*.studentId').isInt().withMessage('Valid student ID is required'),
    body('marks.*.marksObtained').isFloat({ min: 0 }).withMessage('Marks cannot be negative')
  ],

  // Announcement validations
  announcement: [
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().isIn(['General', 'Academic', 'Exam', 'Event', 'Holiday', 'Urgent', 'Other'])
      .withMessage('Invalid category'),
    body('priority').optional().isIn(['Low', 'Normal', 'High', 'Urgent'])
      .withMessage('Invalid priority')
  ],

  // Integer ID param validation
  mongoId: [
    param('id').isInt().withMessage('Invalid ID format')
  ]
};

module.exports = { validate, validationRules };
