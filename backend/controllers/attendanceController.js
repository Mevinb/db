/**
 * Attendance Controller
 * CRUD operations for attendance records
 */

const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get attendance records
 * @route   GET /api/attendance
 * @access  Private
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { course, student, date, startDate, endDate, status } = req.query;

  const query = {};
  if (course) query.course = course;
  if (student) query.student = student;
  if (date) query.date = new Date(date);
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (status) query.status = status;

  const attendance = await Attendance.find(query)
    .populate('student', 'name rollNumber')
    .populate('course', 'name code')
    .populate('markedBy', 'name')
    .sort({ date: -1, session: 1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

/**
 * @desc    Get attendance for a course on a date
 * @route   GET /api/attendance/course/:courseId/date/:date
 * @access  Private
 */
const getCourseAttendance = asyncHandler(async (req, res) => {
  const { courseId, date } = req.params;
  const { session = 1 } = req.query;

  // Get all enrolled students
  const enrollments = await Enrollment.find({
    course: courseId,
    status: 'Enrolled'
  }).populate('student', 'name rollNumber email');

  // Get attendance records for this date
  const attendanceRecords = await Attendance.find({
    course: courseId,
    date: new Date(date),
    session: parseInt(session)
  });

  // Create a map for quick lookup
  const attendanceMap = {};
  attendanceRecords.forEach(record => {
    attendanceMap[record.student.toString()] = record;
  });

  // Combine with enrollment data
  const data = enrollments.map(enrollment => {
    const attendance = attendanceMap[enrollment.student._id.toString()];
    return {
      student: enrollment.student,
      status: attendance ? attendance.status : null,
      remarks: attendance ? attendance.remarks : '',
      attendanceId: attendance ? attendance._id : null
    };
  });

  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Mark single attendance
 * @route   POST /api/attendance
 * @access  Private/Faculty
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { student, course, date, status, session = 1, remarks } = req.body;

  // Check if attendance already marked
  let attendance = await Attendance.findOne({
    student,
    course,
    date: new Date(date),
    session
  });

  if (attendance) {
    // Update existing record
    attendance.status = status;
    attendance.remarks = remarks;
    attendance.markedBy = req.user.profileId || req.user._id;
    await attendance.save();
  } else {
    // Create new record
    attendance = await Attendance.create({
      student,
      course,
      date: new Date(date),
      status,
      session,
      remarks,
      markedBy: req.user.profileId || req.user._id
    });
  }

  const populatedAttendance = await Attendance.findById(attendance._id)
    .populate('student', 'name rollNumber')
    .populate('course', 'name code');

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: populatedAttendance
  });
});

/**
 * @desc    Mark bulk attendance for a course
 * @route   POST /api/attendance/bulk
 * @access  Private/Faculty
 */
const markBulkAttendance = asyncHandler(async (req, res) => {
  const { course, date, session = 1, records } = req.body;

  const results = {
    success: 0,
    updated: 0,
    failed: 0
  };

  for (const record of records) {
    try {
      let attendance = await Attendance.findOne({
        student: record.student,
        course,
        date: new Date(date),
        session
      });

      if (attendance) {
        attendance.status = record.status;
        attendance.remarks = record.remarks || '';
        attendance.markedBy = req.user.profileId || req.user._id;
        await attendance.save();
        results.updated++;
      } else {
        await Attendance.create({
          student: record.student,
          course,
          date: new Date(date),
          status: record.status,
          session,
          remarks: record.remarks || '',
          markedBy: req.user.profileId || req.user._id
        });
        results.success++;
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      results.failed++;
    }
  }

  res.status(201).json({
    success: true,
    message: `Attendance marked: ${results.success} new, ${results.updated} updated, ${results.failed} failed`,
    data: results
  });
});

/**
 * @desc    Update attendance
 * @route   PUT /api/attendance/:id
 * @access  Private/Faculty
 */
const updateAttendance = asyncHandler(async (req, res) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { ...req.body, markedBy: req.user.profileId || req.user._id },
    { new: true, runValidators: true }
  )
    .populate('student', 'name rollNumber')
    .populate('course', 'name code');

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: attendance
  });
});

/**
 * @desc    Delete attendance
 * @route   DELETE /api/attendance/:id
 * @access  Private/Admin
 */
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  await attendance.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

/**
 * @desc    Get attendance summary for a course
 * @route   GET /api/attendance/summary/course/:courseId
 * @access  Private
 */
const getCourseAttendanceSummary = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Get all enrolled students
  const enrollments = await Enrollment.find({
    course: courseId,
    status: 'Enrolled'
  }).populate('student', 'name rollNumber');

  // Get attendance for each student
  const summary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const total = await Attendance.countDocuments({
        student: enrollment.student._id,
        course: courseId
      });

      const present = await Attendance.countDocuments({
        student: enrollment.student._id,
        course: courseId,
        status: { $in: ['Present', 'Late'] }
      });

      const absent = await Attendance.countDocuments({
        student: enrollment.student._id,
        course: courseId,
        status: 'Absent'
      });

      return {
        student: enrollment.student,
        totalClasses: total,
        present,
        absent,
        late: total - present - absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    count: summary.length,
    data: summary
  });
});

/**
 * @desc    Get attendance summary for a student
 * @route   GET /api/attendance/summary/student/:studentId
 * @access  Private
 */
const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { semester } = req.query;

  const enrollmentQuery = {
    student: studentId,
    status: 'Enrolled'
  };
  if (semester) {
    enrollmentQuery.semester = semester;
  }

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('course', 'name code');

  const summary = await Promise.all(
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
        course: enrollment.course,
        totalClasses: total,
        attended: present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    count: summary.length,
    data: summary
  });
});

module.exports = {
  getAttendance,
  getCourseAttendance,
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
  getCourseAttendanceSummary,
  getStudentAttendanceSummary
};
