/**
 * Mark Controller
 * CRUD operations for marks/grades management
 */

const { Op } = require('sequelize');
const { Mark, Student, Course, Exam, Faculty, Enrollment, Semester } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getFacultyCourseIds, facultyOwnsCourse, facultyOwnsExam } = require('../middleware/facultyOwnership');

const getMarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, student, course, exam, isPublished } = req.query;

  const where = {};
  if (student) where.studentId = student;
  if (course) where.courseId = course;
  if (exam) where.examId = exam;
  if (isPublished !== undefined) where.isPublished = isPublished === 'true';

  // Faculty can only see marks for their own courses
  const courseIds = await getFacultyCourseIds(req.user);
  if (courseIds !== null) {
    if (courseIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, currentPage: 1, data: [] });
    }
    where.courseId = where.courseId
      ? (courseIds.includes(parseInt(where.courseId)) ? where.courseId : -1)
      : { [Op.in]: courseIds };
  }

  const { count: total, rows: marks } = await Mark.findAndCountAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'totalMarks', 'passingMarks'] },
      { model: Faculty, as: 'enteredByFaculty', attributes: ['name', 'employeeId'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: marks.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: marks
  });
});

const getExamMarks = asyncHandler(async (req, res) => {
  // Faculty can only view marks for exams in their own courses
  const owns = await facultyOwnsExam(req.user, req.params.examId);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only view marks for exams in courses assigned to you' });
  }

  const marks = await Mark.findAll({
    where: { examId: req.params.examId },
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'email'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Faculty, as: 'enteredByFaculty', attributes: ['name', 'employeeId'] }
    ],
    order: [[{ model: Student, as: 'student' }, 'rollNumber', 'ASC']]
  });

  res.status(200).json({ success: true, count: marks.length, data: marks });
});

const enterMark = asyncHandler(async (req, res) => {
  const { studentId, examId, courseId, marksObtained, enteredBy } = req.body;

  // Faculty can only enter marks for their own courses
  if (courseId) {
    const owns = await facultyOwnsCourse(req.user, courseId);
    if (!owns) {
      return res.status(403).json({ success: false, message: 'You can only enter marks for courses assigned to you' });
    }
  }

  // Check for existing mark
  const existing = await Mark.findOne({
    where: { studentId, examId }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Marks already entered for this student in this exam'
    });
  }

  const mark = await Mark.create({
    studentId,
    examId,
    courseId,
    marksObtained,
    enteredBy: enteredBy || req.user?.id
  });

  const populated = await Mark.findByPk(mark.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'totalMarks'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Mark entered successfully',
    data: populated
  });
});

const enterBulkMarks = asyncHandler(async (req, res) => {
  const { examId, courseId, marks: markEntries, enteredBy } = req.body;

  // Faculty can only enter marks for their own courses
  if (courseId) {
    const owns = await facultyOwnsCourse(req.user, courseId);
    if (!owns) {
      return res.status(403).json({ success: false, message: 'You can only enter marks for courses assigned to you' });
    }
  }

  if (!markEntries || !Array.isArray(markEntries) || markEntries.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide mark entries'
    });
  }

  const results = { successful: 0, updated: 0, failed: [] };

  for (const entry of markEntries) {
    try {
      const existing = await Mark.findOne({
        where: { studentId: entry.studentId, examId }
      });

      if (existing) {
        await existing.update({
          marksObtained: entry.marksObtained,
          enteredBy: enteredBy || req.user?.id
        });
        results.updated++;
      } else {
        await Mark.create({
          studentId: entry.studentId,
          examId,
          courseId,
          marksObtained: entry.marksObtained,
          enteredBy: enteredBy || req.user?.id
        });
        results.successful++;
      }
    } catch (error) {
      results.failed.push({ studentId: entry.studentId, reason: error.message });
    }
  }

  res.status(200).json({
    success: true,
    message: `Created: ${results.successful}, Updated: ${results.updated}, Failed: ${results.failed.length}`,
    data: results
  });
});

const updateMark = asyncHandler(async (req, res) => {
  let mark = await Mark.findByPk(req.params.id);

  if (!mark) {
    return res.status(404).json({ success: false, message: 'Mark entry not found' });
  }

  // Faculty can only update marks for their own courses
  const owns = await facultyOwnsCourse(req.user, mark.courseId);
  if (!owns) {
    return res.status(403).json({ success: false, message: 'You can only update marks for courses assigned to you' });
  }

  await mark.update(req.body);

  mark = await Mark.findByPk(req.params.id, {
    include: [
      { model: Student, as: 'student', attributes: ['name', 'rollNumber'] },
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'totalMarks'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Mark updated successfully',
    data: mark
  });
});

const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findByPk(req.params.id);

  if (!mark) {
    return res.status(404).json({ success: false, message: 'Mark entry not found' });
  }

  await mark.destroy();

  res.status(200).json({ success: true, message: 'Mark entry deleted' });
});

const getStudentGradesSummary = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const marks = await Mark.findAll({
    where: { studentId },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code', 'credits'] },
      { model: Exam, as: 'exam', attributes: ['name', 'type', 'totalMarks', 'passingMarks'] }
    ],
    order: [[{ model: Course, as: 'course' }, 'code', 'ASC']]
  });

  // Group by course
  const courseMap = {};
  for (const mark of marks) {
    const courseId = mark.courseId;
    if (!courseMap[courseId]) {
      courseMap[courseId] = {
        course: mark.course,
        exams: [],
        totalMarksObtained: 0,
        totalMaxMarks: 0
      };
    }
    courseMap[courseId].exams.push({
      exam: mark.exam,
      marksObtained: mark.marksObtained,
      percentage: mark.percentage,
      grade: mark.grade,
      isPassed: mark.isPassed
    });
    courseMap[courseId].totalMarksObtained += mark.marksObtained;
    courseMap[courseId].totalMaxMarks += mark.exam.totalMarks;
  }

  const summary = Object.values(courseMap).map(item => ({
    ...item,
    overallPercentage: item.totalMaxMarks > 0 ? parseFloat(((item.totalMarksObtained / item.totalMaxMarks) * 100).toFixed(2)) : 0
  }));

  res.status(200).json({
    success: true,
    count: summary.length,
    data: summary
  });
});

module.exports = {
  getMarks,
  getExamMarks,
  enterMark,
  enterBulkMarks,
  updateMark,
  deleteMark,
  getStudentGradesSummary
};
