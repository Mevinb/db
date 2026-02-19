/**
 * Dashboard Controller
 * Dashboard statistics for admin, faculty, and student
 */

const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../models');
const {
  User, Department, Program, Faculty, Student,
  Semester, Course, Enrollment, Attendance,
  Exam, Mark, Announcement
} = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getAdminDashboard = asyncHandler(async (req, res) => {
  // Parallel count queries
  const [
    totalStudents,
    totalFaculty,
    totalDepartments,
    totalPrograms,
    totalCourses,
    activeStudents,
    activeFaculty,
    activeSemesters,
    totalEnrollments,
    totalExams
  ] = await Promise.all([
    Student.count(),
    Faculty.count(),
    Department.count(),
    Program.count(),
    Course.count(),
    Student.count({ where: { status: 'Active' } }),
    Faculty.count({ where: { status: 'Active' } }),
    Semester.count({ where: { isCurrent: true } }),
    Enrollment.count(),
    Exam.count()
  ]);

  // Department-wise student count
  const departmentStats = await Department.findAll({
    attributes: [
      'id', 'name', 'code',
      [fn('COUNT', col('students.id')), 'studentCount']
    ],
    include: [{
      model: Student,
      as: 'students',
      attributes: [],
      required: false
    }],
    group: ['Department.id'],
    raw: true
  });

  // Department-wise faculty count
  const departmentFacultyStats = await Department.findAll({
    attributes: [
      'id', 'name', 'code',
      [fn('COUNT', col('facultyMembers.id')), 'facultyCount']
    ],
    include: [{
      model: Faculty,
      as: 'facultyMembers',
      attributes: [],
      required: false
    }],
    group: ['Department.id'],
    raw: true
  });

  // Recent announcements
  const recentAnnouncements = await Announcement.findAll({
    where: { isActive: true },
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  // Enrollment trends - enrollments per semester
  const enrollmentTrends = await Semester.findAll({
    attributes: [
      'id', 'name', 'academicYear',
      [fn('COUNT', col('enrollments.id')), 'enrollmentCount']
    ],
    include: [{
      model: Enrollment,
      as: 'enrollments',
      attributes: [],
      required: false
    }],
    group: ['Semester.id'],
    order: [['startDate', 'DESC']],
    limit: 6,
    raw: true
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalPrograms,
        totalCourses,
        activeStudents,
        activeFaculty,
        activeSemesters,
        totalEnrollments,
        totalExams
      },
      departmentStats,
      departmentFacultyStats,
      recentAnnouncements,
      enrollmentTrends
    }
  });
});

const getFacultyDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get the faculty record for this user
  const faculty = await Faculty.findOne({
    where: { userId },
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
  });

  if (!faculty) {
    return res.status(404).json({ success: false, message: 'Faculty profile not found' });
  }

  // Get courses assigned to this faculty
  const courses = await Course.findAll({
    where: { facultyId: faculty.id },
    include: [
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'academicYear', 'isCurrent'] }
    ]
  });

  const courseIds = courses.map(c => c.id);

  // Get enrollment counts per course
  const enrollmentCounts = await Enrollment.findAll({
    attributes: [
      'courseId',
      [fn('COUNT', col('id')), 'studentCount']
    ],
    where: { courseId: { [Op.in]: courseIds }, status: 'Enrolled' },
    group: ['courseId'],
    raw: true
  });

  const enrollmentMap = {};
  enrollmentCounts.forEach(e => { enrollmentMap[e.courseId] = parseInt(e.studentCount); });

  // Count exams per course
  const examCounts = courseIds.length > 0 ? await Exam.findAll({
    attributes: [
      'courseId',
      [fn('COUNT', col('id')), 'examCount']
    ],
    where: { courseId: { [Op.in]: courseIds } },
    group: ['courseId'],
    raw: true
  }) : [];

  const examMap = {};
  examCounts.forEach(e => { examMap[e.courseId] = parseInt(e.examCount); });

  const courseData = courses.map(c => ({
    course: { id: c.id, name: c.name, code: c.code },
    enrolledStudents: enrollmentMap[c.id] || 0,
    exams: examMap[c.id] || 0
  }));

  // Pending attendance: courses where today's attendance hasn't been marked
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const markedToday = courseIds.length > 0 ? await Attendance.findAll({
    attributes: ['courseId'],
    where: {
      courseId: { [Op.in]: courseIds },
      markedBy: faculty.id,
      date: today
    },
    group: ['courseId'],
    raw: true
  }) : [];
  const markedCourseIds = new Set(markedToday.map(a => a.courseId));
  const pendingAttendance = courses
    .filter(c => !markedCourseIds.has(c.id))
    .map(c => ({ id: c.id, name: c.name, code: c.code }));

  // Current semester
  const currentSemester = await Semester.findOne({
    where: { isCurrent: true },
    attributes: ['name', 'code']
  });

  // Upcoming exams
  const upcomingExams = await Exam.findAll({
    where: {
      courseId: { [Op.in]: courseIds },
      date: { [Op.gte]: new Date() }
    },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] }
    ],
    order: [['date', 'ASC']],
    limit: 5
  });

  // Recent announcements
  const recentAnnouncements = await Announcement.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  const totalStudents = Object.values(enrollmentMap).reduce((a, b) => a + b, 0);

  res.status(200).json({
    success: true,
    data: {
      faculty: {
        name: faculty.name,
        employeeId: faculty.employeeId,
        department: faculty.department,
        designation: faculty.designation
      },
      overview: {
        totalCourses: courses.length,
        totalStudents
      },
      totalCourses: courses.length,
      totalStudents,
      courses: courseData,
      pendingAttendance,
      currentSemester: currentSemester ? { name: currentSemester.name, code: currentSemester.code } : null,
      upcomingExams,
      recentAnnouncements
    }
  });
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get the student record for this user
  const student = await Student.findOne({
    where: { userId },
    include: [
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Department, as: 'department', attributes: ['name', 'code'] }
    ]
  });

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student profile not found' });
  }

  // Get current enrollments
  const enrollments = await Enrollment.findAll({
    where: { studentId: student.id, status: 'Enrolled' },
    include: [
      {
        model: Course, as: 'course', attributes: ['name', 'code', 'credits', 'type'],
        include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'academicYear', 'isCurrent'] }
    ]
  });

  // Attendance summary per course
  const courseIds = enrollments.map(e => e.courseId);
  const attendanceSummary = [];

  for (const enrollment of enrollments) {
    const totalClasses = await Attendance.count({
      where: { studentId: student.id, courseId: enrollment.courseId }
    });
    const present = await Attendance.count({
      where: { studentId: student.id, courseId: enrollment.courseId, status: 'Present' }
    });
    attendanceSummary.push({
      courseId: enrollment.courseId,
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      totalClasses,
      present,
      absent: totalClasses - present,
      percentage: totalClasses > 0 ? parseFloat(((present / totalClasses) * 100).toFixed(2)) : 0
    });
  }

  // Upcoming exams
  const upcomingExams = await Exam.findAll({
    where: {
      courseId: { [Op.in]: courseIds },
      date: { [Op.gte]: new Date() }
    },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] }
    ],
    order: [['date', 'ASC']],
    limit: 5
  });

  // Recent marks
  const recentMarks = await Mark.findAll({
    where: { studentId: student.id, isPublished: true },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'totalMarks'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: 10
  });

  // Active announcements
  const now = new Date();
  const announcements = await Announcement.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { startDate: null },
        { startDate: { [Op.lte]: now } }
      ]
    },
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
    limit: 5
  });

  res.status(200).json({
    success: true,
    data: {
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        program: student.program,
        department: student.department,
        currentSemester: student.currentSemester,
        status: student.status
      },
      enrollments,
      attendanceSummary,
      upcomingExams,
      recentMarks,
      announcements
    }
  });
});

module.exports = {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard
};
