/**
 * Dashboard Controller
 * Provides statistics and overview data for dashboards
 */

const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/dashboard/admin
 * @access  Private/Admin
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const Department = require('../models/Department');
  const Program = require('../models/Program');
  const Faculty = require('../models/Faculty');
  const Student = require('../models/Student');
  const Course = require('../models/Course');
  const Enrollment = require('../models/Enrollment');
  const Announcement = require('../models/Announcement');
  const Semester = require('../models/Semester');

  // Get counts
  const [
    departmentCount,
    programCount,
    facultyCount,
    studentCount,
    courseCount,
    enrollmentCount,
    announcementCount,
    currentSemester
  ] = await Promise.all([
    Department.countDocuments({ isActive: true }),
    Program.countDocuments({ isActive: true }),
    Faculty.countDocuments({ isActive: true }),
    Student.countDocuments({ status: 'Active' }),
    Course.countDocuments({ isActive: true }),
    Enrollment.countDocuments({ status: 'Enrolled' }),
    Announcement.countDocuments({ isActive: true }),
    Semester.findOne({ isCurrent: true })
  ]);

  // Get department-wise statistics
  const departmentStats = await Department.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'department',
        as: 'students'
      }
    },
    {
      $lookup: {
        from: 'faculties',
        localField: '_id',
        foreignField: 'department',
        as: 'faculty'
      }
    },
    {
      $project: {
        name: 1,
        code: 1,
        studentCount: { $size: '$students' },
        facultyCount: { $size: '$faculty' }
      }
    },
    { $sort: { name: 1 } }
  ]);

  // Get recent enrollments
  const recentEnrollments = await Enrollment.find({ status: 'Enrolled' })
    .populate('student', 'name rollNumber')
    .populate('course', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get program-wise student distribution
  const programStats = await Student.aggregate([
    { $match: { status: 'Active' } },
    {
      $group: {
        _id: '$program',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'programs',
        localField: '_id',
        foreignField: '_id',
        as: 'program'
      }
    },
    { $unwind: '$program' },
    {
      $project: {
        name: '$program.name',
        code: '$program.code',
        count: 1
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        departments: departmentCount,
        programs: programCount,
        faculty: facultyCount,
        students: studentCount,
        courses: courseCount,
        enrollments: enrollmentCount,
        announcements: announcementCount
      },
      currentSemester,
      departmentStats,
      programStats,
      recentEnrollments
    }
  });
});

/**
 * @desc    Get faculty dashboard stats
 * @route   GET /api/dashboard/faculty
 * @access  Private/Faculty
 */
const getFacultyDashboard = asyncHandler(async (req, res) => {
  const Course = require('../models/Course');
  const Enrollment = require('../models/Enrollment');
  const Attendance = require('../models/Attendance');
  const Exam = require('../models/Exam');
  const Announcement = require('../models/Announcement');
  const Semester = require('../models/Semester');

  const facultyId = req.user.profileId;

  // Get current semester
  const currentSemester = await Semester.findOne({ isCurrent: true });

  // Get assigned courses
  const courses = await Course.find({
    faculty: facultyId,
    isActive: true,
    ...(currentSemester && { semester: currentSemester._id })
  })
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code');

  // Get course-wise stats
  const courseStats = await Promise.all(
    courses.map(async (course) => {
      const enrolledCount = await Enrollment.countDocuments({
        course: course._id,
        status: 'Enrolled'
      });

      const examCount = await Exam.countDocuments({ course: course._id });

      return {
        course: {
          id: course._id,
          name: course.name,
          code: course.code
        },
        enrolledStudents: enrolledCount,
        exams: examCount
      };
    })
  );

  // Get pending attendance (courses without today's attendance)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingAttendance = [];
  for (const course of courses) {
    const hasAttendance = await Attendance.findOne({
      course: course._id,
      date: today
    });

    if (!hasAttendance) {
      pendingAttendance.push({
        id: course._id,
        name: course.name,
        code: course.code
      });
    }
  }

  // Get recent announcements
  const announcements = await Announcement.find({
    isActive: true,
    $or: [
      { targetRoles: { $size: 0 } },
      { targetRoles: 'faculty' }
    ]
  })
    .sort({ publishDate: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalCourses: courses.length,
        totalStudents: courseStats.reduce((sum, c) => sum + c.enrolledStudents, 0)
      },
      currentSemester,
      courses: courseStats,
      pendingAttendance,
      announcements
    }
  });
});

/**
 * @desc    Get student dashboard stats
 * @route   GET /api/dashboard/student
 * @access  Private/Student
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
  const Student = require('../models/Student');
  const Enrollment = require('../models/Enrollment');
  const Attendance = require('../models/Attendance');
  const Mark = require('../models/Mark');
  const Announcement = require('../models/Announcement');
  const Semester = require('../models/Semester');

  const studentId = req.user.profileId;

  // Get student profile
  const student = await Student.findById(studentId)
    .populate('department', 'name code')
    .populate('program', 'name code');

  // Get current semester
  const currentSemester = await Semester.findOne({ isCurrent: true });

  // Get current enrollments
  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'Enrolled',
    ...(currentSemester && { semester: currentSemester._id })
  })
    .populate({
      path: 'course',
      populate: [
        { path: 'faculty', select: 'name' },
        { path: 'department', select: 'name' }
      ]
    })
    .populate('semester', 'name code');

  // Get attendance summary for each course
  const attendanceSummary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const total = await Attendance.countDocuments({
        student: studentId,
        course: enrollment.course._id
      });

      const present = await Attendance.countDocuments({
        student: studentId,
        course: enrollment.course._id,
        status: { $in: ['Present', 'Late'] }
      });

      return {
        course: {
          id: enrollment.course._id,
          name: enrollment.course.name,
          code: enrollment.course.code,
          faculty: enrollment.course.faculty?.name
        },
        totalClasses: total,
        attended: present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  // Get recent marks
  const recentMarks = await Mark.find({
    student: studentId,
    isPublished: true
  })
    .populate('course', 'name code')
    .populate('exam', 'name type')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get announcements
  const announcements = await Announcement.find({
    isActive: true,
    $or: [
      { targetRoles: { $size: 0 } },
      { targetRoles: 'student' }
    ]
  })
    .sort({ publishDate: -1 })
    .limit(5);

  // Calculate overall attendance
  const totalClasses = attendanceSummary.reduce((sum, a) => sum + a.totalClasses, 0);
  const totalAttended = attendanceSummary.reduce((sum, a) => sum + a.attended, 0);
  const overallAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      profile: {
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        program: student.program,
        semester: student.currentSemester,
        cgpa: student.cgpa
      },
      overview: {
        enrolledCourses: enrollments.length,
        overallAttendance,
        cgpa: student.cgpa
      },
      currentSemester,
      attendanceSummary,
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
