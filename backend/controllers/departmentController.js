/**
 * Department Controller
 * CRUD operations for departments
 */

const Department = require('../models/Department');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private
 */
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Department.countDocuments(query);
  const departments = await Department.find(query)
    .populate('headOfDepartment', 'name employeeId')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ name: 1 });

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
  const department = await Department.findById(req.params.id)
    .populate('headOfDepartment', 'name employeeId email')
    .populate('programs')
    .populate('facultyMembers');

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
  let department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('headOfDepartment', 'name employeeId');

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
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  // Check for dependent records
  const Program = require('../models/Program');
  const Faculty = require('../models/Faculty');
  const Student = require('../models/Student');

  const programCount = await Program.countDocuments({ department: req.params.id });
  const facultyCount = await Faculty.countDocuments({ department: req.params.id });
  const studentCount = await Student.countDocuments({ department: req.params.id });

  if (programCount > 0 || facultyCount > 0 || studentCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete department. It has ${programCount} programs, ${facultyCount} faculty members, and ${studentCount} students.`
    });
  }

  await department.deleteOne();

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
  const Program = require('../models/Program');
  const Faculty = require('../models/Faculty');
  const Student = require('../models/Student');
  const Course = require('../models/Course');

  const departmentId = req.params.id;

  const [programCount, facultyCount, studentCount, courseCount] = await Promise.all([
    Program.countDocuments({ department: departmentId, isActive: true }),
    Faculty.countDocuments({ department: departmentId, isActive: true }),
    Student.countDocuments({ department: departmentId, status: 'Active' }),
    Course.countDocuments({ department: departmentId, isActive: true })
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
