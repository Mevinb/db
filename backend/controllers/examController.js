/**
 * Exam Controller
 * CRUD operations for exam management
 */

const { Op } = require('sequelize');
const { Exam, Course, Semester, Mark, Student, Faculty } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, course, semester, type, status, search } = req.query;

  const where = {};
  if (course) where.courseId = course;
  if (semester) where.semesterId = semester;
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const { count: total, rows: exams } = await Exam.findAndCountAll({
    where,
    include: [
      {
        model: Course, as: 'course', attributes: ['name', 'code'],
        include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: exams.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: exams
  });
});

const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id, {
    include: [
      {
        model: Course, as: 'course', attributes: ['name', 'code'],
        include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'employeeId'] }]
      },
      { model: Semester, as: 'semester', attributes: ['name', 'code', 'academicYear'] }
    ]
  });

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  res.status(200).json({ success: true, data: exam });
});

const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);

  const populatedExam = await Exam.findByPk(exam.id, {
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: populatedExam
  });
});

const updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  await exam.update(req.body);

  exam = await Exam.findByPk(req.params.id, {
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: exam
  });
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  const markCount = await Mark.count({ where: { examId: req.params.id } });
  if (markCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete exam. It has ${markCount} mark entries.`
    });
  }

  await exam.destroy();

  res.status(200).json({ success: true, message: 'Exam deleted successfully' });
});

const getExamsByCourse = asyncHandler(async (req, res) => {
  const exams = await Exam.findAll({
    where: { courseId: req.params.courseId },
    include: [
      { model: Course, as: 'course', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ],
    order: [['date', 'ASC']]
  });

  res.status(200).json({ success: true, count: exams.length, data: exams });
});

const publishExamResults = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Update all marks for this exam to published
  await Mark.update(
    { isPublished: true },
    { where: { examId: req.params.id } }
  );

  await exam.update({ status: 'Completed', isPublished: true });

  res.status(200).json({
    success: true,
    message: 'Exam results published successfully'
  });
});

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamsByCourse,
  publishExamResults
};
