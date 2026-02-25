/**
 * Attendance Controller
 * CRUD operations for attendance management
 */

const { Op } = require('sequelize');
const { Attendance, Student, Course, Faculty, Enrollment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getFacultyCourseIds, facultyOwnsCourse } = require('../middleware/facultyOwnership');

const getAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, student, course, date, startDate, endDate, status, session } = req.query;

  const where = {};
  if (student) where.studentId = student;
  if (course) where.courseId = course;
  if (status) where.status = status;
  if (session) where.session = session;
  if (date) where.date = date;
  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  // Faculty can only see attendance for their own courses
  const courseIds = await getFacultyCourseIds(req.user);
  if (courseIds !== null) {
    if (courseIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, currentPage: 1, data: [] });
    }
    where.courseId = where.courseId
      ? (courseIds.includes(parseInt(where.courseId)) ? where.courseId : -1)
      : { [Op.in]: courseIds };
  }

  const { count: total, rows: records } = await Attendance.findAndCountAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Faculty, as: 'markedByFaculty', attributes: ['name', 'employeeId'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['date', 'DESC'], ['session', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: records
  });
});

const getCourseAttendance = asyncHandler(async (req, res) => {
  // Faculty can only view attendance for their own courses
  const owns = await facultyOwnsCourse(req.user, req.params.courseId);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only view attendance for courses assigned to you' });
  }

  const { session } = req.query;
  const date = req.params.date || req.query.date;

  const where = { courseId: req.params.courseId };
  if (date) where.date = date;
  if (session) where.session = session;

  const records = await Attendance.findAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Faculty, as: 'markedByFaculty', attributes: ['name', 'employeeId'] }
    ],
    order: [['date', 'DESC'], ['session', 'ASC']]
  });

  res.status(200).json({ success: true, count: records.length, data: records });
});

const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, courseId, date, session, status, markedBy } = req.body;

  // Faculty can only mark attendance for their own courses
  if (courseId) {
    const owns = await facultyOwnsCourse(req.user, courseId);
    if (!owns) {
      return res.status(403).json({ success: false, message: 'You can only mark attendance for courses assigned to you' });
    }
  }

  // Check for existing attendance
  const existing = await Attendance.findOne({
    where: { studentId, courseId, date, session }
  });

  if (existing) {
    await existing.update({ status, markedBy: markedBy || req.user?.id });
    const updated = await Attendance.findByPk(existing.id, {
      include: [
        { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
        { model: Course, as: 'course', attributes: ['name', 'code'] }
      ]
    });
    return res.status(200).json({
      success: true,
      message: 'Attendance updated',
      data: updated
    });
  }

  const attendance = await Attendance.create({
    studentId,
    courseId,
    date,
    session,
    status,
    markedBy: markedBy || req.user?.id
  });

  const populated = await Attendance.findByPk(attendance.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: populated
  });
});

const markBulkAttendance = asyncHandler(async (req, res) => {
  const { courseId, date, session, records, markedBy } = req.body;

  // Faculty can only mark attendance for their own courses
  if (courseId) {
    const owns = await facultyOwnsCourse(req.user, courseId);
    if (!owns) {
      return res.status(403).json({ success: false, message: 'You can only mark attendance for courses assigned to you' });
    }
  }

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide attendance records'
    });
  }

  const results = { successful: 0, updated: 0, failed: [] };

  for (const record of records) {
    try {
      const existing = await Attendance.findOne({
        where: {
          studentId: record.studentId,
          courseId,
          date,
          session
        }
      });

      if (existing) {
        await existing.update({ status: record.status, markedBy: markedBy || req.user?.id });
        results.updated++;
      } else {
        await Attendance.create({
          studentId: record.studentId,
          courseId,
          date,
          session,
          status: record.status,
          markedBy: markedBy || req.user?.id
        });
        results.successful++;
      }
    } catch (error) {
      results.failed.push({ studentId: record.studentId, reason: error.message });
    }
  }

  res.status(200).json({
    success: true,
    message: `Marked: ${results.successful}, Updated: ${results.updated}, Failed: ${results.failed.length}`,
    data: results
  });
});

const updateAttendance = asyncHandler(async (req, res) => {
  let attendance = await Attendance.findByPk(req.params.id);

  if (!attendance) {
    return res.status(404).json({ success: false, message: 'Attendance record not found' });
  }

  // Faculty can only update attendance for their own courses
  const owns = await facultyOwnsCourse(req.user, attendance.courseId);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only update attendance for courses assigned to you' });
  }

  await attendance.update(req.body);

  attendance = await Attendance.findByPk(req.params.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: attendance
  });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByPk(req.params.id);

  if (!attendance) {
    return res.status(404).json({ success: false, message: 'Attendance record not found' });
  }

  await attendance.destroy();

  res.status(200).json({ success: true, message: 'Attendance record deleted' });
});

const getCourseAttendanceSummary = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;

  // Faculty can only view attendance summary for their own courses
  const owns = await facultyOwnsCourse(req.user, courseId);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only view attendance summary for courses assigned to you' });
  }

  // Get all enrolled students for this course
  const enrollments = await Enrollment.findAll({
    where: { courseId, status: 'Enrolled' },
    include: [
      { model: Student, as: 'student', attributes: ['id', 'name', 'rollNumber'] }
    ]
  });

  const summary = [];

  for (const enrollment of enrollments) {
    const totalClasses = await Attendance.count({
      where: { courseId, studentId: enrollment.studentId }
    });

    const presentClasses = await Attendance.count({
      where: { courseId, studentId: enrollment.studentId, status: 'Present' }
    });

    summary.push({
      student: enrollment.student,
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      attendancePercentage: totalClasses > 0 ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2)) : 0
    });
  }

  res.status(200).json({ success: true, count: summary.length, data: summary });
});

const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const enrollments = await Enrollment.findAll({
    where: { studentId, status: 'Enrolled' },
    include: [
      { model: Course, as: 'course', attributes: ['id', 'name', 'code'] }
    ]
  });

  const summary = [];

  for (const enrollment of enrollments) {
    const totalClasses = await Attendance.count({
      where: { courseId: enrollment.courseId, studentId }
    });

    const presentClasses = await Attendance.count({
      where: { courseId: enrollment.courseId, studentId, status: 'Present' }
    });

    summary.push({
      course: enrollment.course,
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      attendancePercentage: totalClasses > 0 ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2)) : 0
    });
  }

  res.status(200).json({ success: true, count: summary.length, data: summary });
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
