/**
 * Program Controller
 * CRUD operations for academic programs
 */

const Program = require('../models/Program');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all programs
 * @route   GET /api/programs
 * @access  Private
 */
const getPrograms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, degreeType, isActive } = req.query;

  const query = {};
  if (department) query.department = department;
  if (degreeType) query.degreeType = degreeType;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Program.countDocuments(query);
  const programs = await Program.find(query)
    .populate('department', 'name code')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: programs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: programs
  });
});

/**
 * @desc    Get single program
 * @route   GET /api/programs/:id
 * @access  Private
 */
const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id)
    .populate('department', 'name code');

  if (!program) {
    return res.status(404).json({
      success: false,
      message: 'Program not found'
    });
  }

  res.status(200).json({
    success: true,
    data: program
  });
});

/**
 * @desc    Create program
 * @route   POST /api/programs
 * @access  Private/Admin
 */
const createProgram = asyncHandler(async (req, res) => {
  const program = await Program.create(req.body);

  const populatedProgram = await Program.findById(program._id)
    .populate('department', 'name code');

  res.status(201).json({
    success: true,
    message: 'Program created successfully',
    data: populatedProgram
  });
});

/**
 * @desc    Update program
 * @route   PUT /api/programs/:id
 * @access  Private/Admin
 */
const updateProgram = asyncHandler(async (req, res) => {
  let program = await Program.findById(req.params.id);

  if (!program) {
    return res.status(404).json({
      success: false,
      message: 'Program not found'
    });
  }

  program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('department', 'name code');

  res.status(200).json({
    success: true,
    message: 'Program updated successfully',
    data: program
  });
});

/**
 * @desc    Delete program
 * @route   DELETE /api/programs/:id
 * @access  Private/Admin
 */
const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    return res.status(404).json({
      success: false,
      message: 'Program not found'
    });
  }

  // Check for dependent records
  const Student = require('../models/Student');
  const Course = require('../models/Course');

  const studentCount = await Student.countDocuments({ program: req.params.id });
  const courseCount = await Course.countDocuments({ program: req.params.id });

  if (studentCount > 0 || courseCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete program. It has ${studentCount} students and ${courseCount} courses.`
    });
  }

  await program.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Program deleted successfully'
  });
});

/**
 * @desc    Get programs by department
 * @route   GET /api/programs/department/:departmentId
 * @access  Private
 */
const getProgramsByDepartment = asyncHandler(async (req, res) => {
  const programs = await Program.find({
    department: req.params.departmentId,
    isActive: true
  }).sort({ name: 1 });

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
