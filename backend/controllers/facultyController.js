/**
 * Faculty Controller
 * CRUD operations for faculty members
 */

const { Op } = require('sequelize');
const { Faculty, User, Department, Course, Program, Semester } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getFaculty = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, designation, isActive } = req.query;

  const where = {};
  if (department) where.departmentId = department;
  if (designation) where.designation = designation;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { employeeId: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: faculty } = await Faculty.findAndCountAll({
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
    count: faculty.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: faculty
  });
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByPk(req.params.id, {
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Course, as: 'coursesTaught' }
    ]
  });

  if (!faculty) {
    return res.status(404).json({ success: false, message: 'Faculty not found' });
  }

  res.status(200).json({ success: true, data: faculty });
});

const createFaculty = asyncHandler(async (req, res) => {
  const { email, password = 'Faculty@123', ...facultyData } = req.body;

  const existingFaculty = await Faculty.findOne({ where: { email } });
  if (existingFaculty) {
    return res.status(400).json({
      success: false,
      message: 'Faculty with this email already exists'
    });
  }

  const faculty = await Faculty.create({ email, ...facultyData });

  const user = await User.create({
    email,
    password,
    name: facultyData.name,
    role: 'faculty',
    profileId: faculty.id,
    profileModel: 'Faculty'
  });

  await faculty.update({ userId: user.id });

  const populatedFaculty = await Faculty.findByPk(faculty.id, {
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
  });

  res.status(201).json({
    success: true,
    message: 'Faculty created successfully with login credentials',
    data: populatedFaculty
  });
});

const updateFaculty = asyncHandler(async (req, res) => {
  let faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return res.status(404).json({ success: false, message: 'Faculty not found' });
  }

  const { password, ...updateData } = req.body;

  if (updateData.email && updateData.email !== faculty.email) {
    const existingFaculty = await Faculty.findOne({ where: { email: updateData.email } });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    if (faculty.userId) {
      await User.update(
        { email: updateData.email, name: updateData.name || faculty.name },
        { where: { id: faculty.userId }, individualHooks: true }
      );
    }
  }

  if (password && faculty.userId) {
    const user = await User.scope('withPassword').findByPk(faculty.userId);
    if (user) {
      user.password = password;
      await user.save();
    }
  }

  await faculty.update(updateData);

  faculty = await Faculty.findByPk(req.params.id, {
    include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
  });

  res.status(200).json({
    success: true,
    message: 'Faculty updated successfully',
    data: faculty
  });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByPk(req.params.id);

  if (!faculty) {
    return res.status(404).json({ success: false, message: 'Faculty not found' });
  }

  const courseCount = await Course.count({ where: { facultyId: req.params.id } });

  if (courseCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete faculty. They are assigned to ${courseCount} courses.`
    });
  }

  if (faculty.userId) {
    await User.destroy({ where: { id: faculty.userId } });
  }

  await faculty.destroy();

  res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
});

const getFacultyByDepartment = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findAll({
    where: {
      departmentId: req.params.departmentId,
      isActive: true
    },
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: faculty.length,
    data: faculty
  });
});

const getFacultyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    where: { facultyId: req.params.id, isActive: true },
    include: [
      { model: Department, as: 'department', attributes: ['name', 'code'] },
      { model: Program, as: 'program', attributes: ['name', 'code'] },
      { model: Semester, as: 'semester', attributes: ['name', 'code'] }
    ],
    order: [['name', 'ASC']]
  });

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
