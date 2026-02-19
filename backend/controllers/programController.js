/**
 * Program Controller
 * CRUD operations for academic programs
 */

const { Op } = require('sequelize');
const { Program, Department, Student, Course } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getPrograms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, degreeType, isActive } = req.query;

  const where = {};
  if (department) where.departmentId = department;
  if (degreeType) where.degreeType = degreeType;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: programs } = await Program.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: programs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: programs
  });
});

const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] }
    ]
  });

  if (!program) {
    return res.status(404).json({ success: false, message: 'Program not found' });
  }

  res.status(200).json({ success: true, data: program });
});

const createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body);

  const populatedProgram = await Program.findByPk(program.id, {
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
  });

  res.status(201).json({
    success: true,
    message: 'Program created successfully',
    data: populatedProgram
  });
});

const updateProgram = asyncHandler(async (req, res) => {
  let program = await Program.findByPk(req.params.id);

  if (!program) {
    return res.status(404).json({ success: false, message: 'Program not found' });
  }

  await program.update(req.body);

  program = await Program.findByPk(req.params.id, {
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
  });

  res.status(200).json({
    success: true,
    message: 'Program updated successfully',
    data: program
  });
});

const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findByPk(req.params.id);

  if (!program) {
    return res.status(404).json({ success: false, message: 'Program not found' });
  }

  const studentCount = await Student.count({ where: { programId: req.params.id } });
  const courseCount = await Course.count({ where: { programId: req.params.id } });

  if (studentCount > 0 || courseCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete program. It has ${studentCount} students and ${courseCount} courses.`
    });
  }

  await program.destroy();

  res.status(200).json({ success: true, message: 'Program deleted successfully' });
});

const getProgramsByDepartment = asyncHandler(async (req, res) => {
  const programs = await Program.findAll({
    where: {
      departmentId: req.params.departmentId,
      isActive: true
    },
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: programs.length,
    data: programs
  });
});

module.exports = {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramsByDepartment
};
