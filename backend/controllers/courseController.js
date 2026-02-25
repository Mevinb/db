/**
 * Course Controller
 * CRUD operations for courses
 */

const { Op } = require('sequelize');
const { Course, Department, Program, Semester, Faculty, Enrollment, Exam, Student } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { facultyOwnsCourse } = require('../middleware/facultyOwnership');

const getCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, program, semester, faculty, type, semesterNumber, isActive } = req.query;

  const where = {};
  if (department) where.departmentId = department;
  if (program) where.programId = program;
  if (semester) where.semesterId = semester;
  if (faculty) where.facultyId = faculty;
  if (type) where.type = type;
  if (semesterNumber) where.semesterNumber = parseInt(semesterNumber);
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: courses } = await Course.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] },
      { model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['code', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: courses
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] },
      { model: Faculty, as: 'faculty', attributes: ['name', 'employeeId', 'email'] }
    ]
  });

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  res.status(200).json({ success: true, data: course });
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);

  const populatedCourse = await Course.findByPk(course.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: populatedCourse
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findByPk(req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  await course.update(req.body);

  course = await Course.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] },
      { model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course
  });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const enrollmentCount = await Enrollment.count({ where: { courseId: req.params.id } });
  const examCount = await Exam.count({ where: { courseId: req.params.id } });

  if (enrollmentCount > 0 || examCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete course. It has ${enrollmentCount} enrollments and ${examCount} exams.`
    });
  }

  await course.destroy();

  res.status(200).json({ success: true, message: 'Course deleted successfully' });
});

const getCourseStudents = asyncHandler(async (req, res) => {
  // Faculty can only see students for their own courses
  const owns = await facultyOwnsCourse(req.user, req.params.id);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only view students for courses assigned to you' });
  }

  const enrollments = await Enrollment.findAll({
    where: {
      courseId: req.params.id,
      status: 'Enrolled'
    },
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'rollNumber', 'email', 'currentSemester']
      }
    ]
  });

  const students = enrollments.map(e => ({
    id: e.student.id,
    name: e.student.name,
    rollNumber: e.student.rollNumber,
    email: e.student.email,
    currentSemester: e.student.currentSemester,
    enrollmentId: e.id,
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

const assignFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;

  const course = await Course.findByPk(req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  await course.update({ facultyId });

  const updatedCourse = await Course.findByPk(req.params.id, {
    include: [
      { model: Faculty, as: 'faculty', attributes: ['name', 'employeeId', 'email'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Faculty assigned successfully',
    data: updatedCourse
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
