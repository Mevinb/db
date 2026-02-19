/**
 * Department Controller
 * CRUD operations for departments
 */

const { Op } = require('sequelize');
const { Department, Faculty, Program, Student, Course } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private
 */
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: departments } = await Department.findAndCountAll({
    where,
    include: [
      { model: Faculty, as: 'hod', attributes: ['name', 'employeeId'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: departments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: departments
  });
});

/**
 * @desc    Get single department
 * @route   GET /api/departments/:id
 * @access  Private
 */
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByPk(req.params.id, {
    include: [
      { model: Faculty, as: 'hod', attributes: ['name', 'employeeId', 'email'] },
      { model: Program, as: 'programs' },
      { model: Faculty, as: 'facultyMembers' }
    ]
  });

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  res.status(200).json({
    success: true,
    data: department
  });
});

/**
 * @desc    Create department
 * @route   POST /api/departments
 * @access  Private/Admin
 */
const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department
  });
});

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
const updateDepartment = asyncHandler(async (req, res) => {
  let department = await Department.findByPk(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  await department.update(req.body);

  department = await Department.findByPk(req.params.id, {
    include: [
      { model: Faculty, as: 'hod', attributes: ['name', 'employeeId'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department
  });
});

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  const programCount = await Program.count({ where: { departmentId: req.params.id } });
  const facultyCount = await Faculty.count({ where: { departmentId: req.params.id } });
  const studentCount = await Student.count({ where: { departmentId: req.params.id } });

  if (programCount > 0 || facultyCount > 0 || studentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete department. It has ${programCount} programs, ${facultyCount} faculty members, and ${studentCount} students.`
    });
  }

  await department.destroy();

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully'
  });
});

/**
 * @desc    Get department statistics
 * @route   GET /api/departments/:id/stats
 * @access  Private
 */
const getDepartmentStats = asyncHandler(async (req, res) => {
  const departmentId = req.params.id;

  const [programCount, facultyCount, studentCount, courseCount] = await Promise.all([
    Program.count({ where: { departmentId, isActive: true } }),
    Faculty.count({ where: { departmentId, isActive: true } }),
    Student.count({ where: { departmentId, status: 'Active' } }),
    Course.count({ where: { departmentId, isActive: true } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      programs: programCount,
      faculty: facultyCount,
      students: studentCount,
      courses: courseCount
    }
  });
});

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
};
