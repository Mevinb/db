/**
 * Faculty Controller
 * CRUD operations for faculty members
 */

const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all faculty
 * @route   GET /api/faculty
 * @access  Private
 */
const getFaculty = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, designation, isActive } = req.query;

  const query = {};
  if (department) query.department = department;
  if (designation) query.designation = designation;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Faculty.countDocuments(query);
  const faculty = await Faculty.find(query)
    .populate('department', 'name code')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: faculty.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: faculty
  });
});

/**
 * @desc    Get single faculty
 * @route   GET /api/faculty/:id
 * @access  Private
 */
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
    .populate('department', 'name code')
    .populate('coursesTaught');

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Faculty not found'
    });
  }

  res.status(200).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Create faculty with user account
 * @route   POST /api/faculty
 * @access  Private/Admin
 */
const createFaculty = asyncHandler(async (req, res) => {
  const { email, password = 'Faculty@123', ...facultyData } = req.body;

  // Check if email already exists
  const existingFaculty = await Faculty.findOne({ email });
  if (existingFaculty) {
    return res.status(400).json({
      success: false,
      message: 'Faculty with this email already exists'
    });
  }

  // Create faculty record
  const faculty = await Faculty.create({ email, ...facultyData });

  // Create user account for faculty
  const user = await User.create({
    email,
    password,
    name: facultyData.name,
    role: 'faculty',
    profileId: faculty._id,
    profileModel: 'Faculty'
  });

  // Link user to faculty
  faculty.user = user._id;
  await faculty.save();

  const populatedFaculty = await Faculty.findById(faculty._id)
    .populate('department', 'name code');

  res.status(201).json({
    success: true,
    message: 'Faculty created successfully with login credentials',
    data: populatedFaculty
  });
});

/**
 * @desc    Update faculty
 * @route   PUT /api/faculty/:id
 * @access  Private/Admin
 */
const updateFaculty = asyncHandler(async (req, res) => {
  let faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Faculty not found'
    });
  }

  // If email is being updated, check for duplicates
  if (req.body.email && req.body.email !== faculty.email) {
    const existingFaculty = await Faculty.findOne({ email: req.body.email });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    // Also update user email
    if (faculty.user) {
      await User.findByIdAndUpdate(faculty.user, {
        email: req.body.email,
        name: req.body.name || faculty.name
      });
    }
  }

  faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('department', 'name code');

  res.status(200).json({
    success: true,
    message: 'Faculty updated successfully',
    data: faculty
  });
});

/**
 * @desc    Delete faculty
 * @route   DELETE /api/faculty/:id
 * @access  Private/Admin
 */
const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Faculty not found'
    });
  }

  // Check for dependent records
  const Course = require('../models/Course');
  const courseCount = await Course.countDocuments({ faculty: req.params.id });

  if (courseCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete faculty. They are assigned to ${courseCount} courses.`
    });
  }

  // Delete associated user account
  if (faculty.user) {
    await User.findByIdAndDelete(faculty.user);
  }

  await faculty.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Faculty deleted successfully'
  });
});

/**
 * @desc    Get faculty by department
 * @route   GET /api/faculty/department/:departmentId
 * @access  Private
 */
const getFacultyByDepartment = asyncHandler(async (req, res) => {
  const faculty = await Faculty.find({
    department: req.params.departmentId,
    isActive: true
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: faculty.length,
    data: faculty
  });
});

/**
 * @desc    Get courses taught by faculty
 * @route   GET /api/faculty/:id/courses
 * @access  Private
 */
const getFacultyCourses = asyncHandler(async (req, res) => {
  const Course = require('../models/Course');
  
  const courses = await Course.find({ faculty: req.params.id, isActive: true })
    .populate('department', 'name code')
    .populate('program', 'name code')
    .populate('semester', 'name code')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyByDepartment,
  getFacultyCourses
};
