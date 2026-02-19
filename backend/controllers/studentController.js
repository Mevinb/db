/**
 * Student Controller
 * CRUD operations for students
 */

const { Op } = require('sequelize');
const { Student, User, Department, Program, Enrollment, Attendance, Mark, Course, Exam, Faculty } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, program, semester, status } = req.query;

  const where = {};
  if (department) where.departmentId = department;
  if (program) where.programId = program;
  if (semester) where.currentSemester = parseInt(semester);
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { rollNumber: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: students } = await Student.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: students
  });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code', 'degreeType'] }
    ]
  });

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.status(200).json({ success: true, data: student });
});

const createStudent = asyncHandler(async (req, res) => {
  const { email, password = 'Student@123', ...studentData } = req.body;

  const existingStudent = await Student.findOne({
    where: {
      [Op.or]: [{ email }, { rollNumber: studentData.rollNumber }]
    }
  });
  if (existingStudent) {
    return res.status(400).json({
      success: false,
      message: 'Student with this email or roll number already exists'
    });
  }

  const student = await Student.create({ email, ...studentData });

  const user = await User.create({
    email,
    password,
    name: studentData.name,
    role: 'student',
    profileId: student.id,
    profileModel: 'Student'
  });

  await student.update({ userId: user.id });

  const populatedStudent = await Student.findByPk(student.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Student created successfully with login credentials',
    data: populatedStudent
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  let student = await Student.findByPk(req.params.id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { password, ...updateData } = req.body;

  if (updateData.email && updateData.email !== student.email) {
    const existingStudent = await Student.findOne({ where: { email: updateData.email } });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email is already in use' });
    }
    if (student.userId) {
      await User.update(
        { email: updateData.email, name: updateData.name || student.name },
        { where: { id: student.userId }, individualHooks: true }
      );
    }
  }

  if (updateData.rollNumber && updateData.rollNumber !== student.rollNumber) {
    const existingStudent = await Student.findOne({ where: { rollNumber: updateData.rollNumber } });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Roll number is already in use' });
    }
  }

  if (password && student.userId) {
    const user = await User.scope('withPassword').findByPk(student.userId);
    if (user) {
      user.password = password;
      await user.save();
    }
  }

  await student.update(updateData);

  student = await Student.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const enrollmentCount = await Enrollment.count({ where: { studentId: req.params.id } });

  if (enrollmentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete student. They have ${enrollmentCount} course enrollments. Consider marking as inactive instead.`
    });
  }

  if (student.userId) {
    await User.destroy({ where: { id: student.userId } });
  }

  await student.destroy();

  res.status(200).json({ success: true, message: 'Student deleted successfully' });
});

const getStudentsByProgram = asyncHandler(async (req, res) => {
  const { semester } = req.query;
  
  const where = {
    programId: req.params.programId,
    status: 'Active'
  };
  
  if (semester) where.currentSemester = parseInt(semester);

  const students = await Student.findAll({
    where,
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
    order: [['rollNumber', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

const getStudentEnrollments = asyncHandler(async (req, res) => {
  const { Semester } = require('../models');
  
  const enrollments = await Enrollment.findAll({
    where: { studentId: req.params.id },
    include: [
      {
        model: Course,
        as: 'course',
        include: [
          { model: Department, as: 'department', attributes: ['name', 'code'] },
          { model: Faculty, as: 'faculty', attributes: ['name'] }
        ]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.findAll({
    where: {
      studentId: req.params.id,
      status: 'Enrolled'
    },
    include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'code'] }]
  });

  const attendanceSummary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const total = await Attendance.count({
        where: { studentId: req.params.id, courseId: enrollment.courseId }
      });
      const present = await Attendance.count({
        where: {
          studentId: req.params.id,
          courseId: enrollment.courseId,
          status: { [Op.in]: ['Present', 'Late'] }
        }
      });

      return {
        course: enrollment.course,
        totalClasses: total,
        attended: present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  res.status(200).json({ success: true, data: attendanceSummary });
});

const getStudentMarks = asyncHandler(async (req, res) => {
  const marks = await Mark.findAll({
    where: {
      studentId: req.params.id,
      isPublished: true
    },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code', 'credits'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'category', 'maxMarks'] }
    ],
    order: [['createdAt', 'DESC']]
  });

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
