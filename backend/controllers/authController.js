/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const { Op } = require('sequelize');
const { User, Student, Faculty, Department, Program } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public (Admin only in production)
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name, role, profileId } = req.body;

  const existingUser = await User.scope('withPassword').findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  let profileModel = null;
  if (role === 'student') profileModel = 'Student';
  if (role === 'faculty') profileModel = 'Faculty';

  const user = await User.create({
    email,
    password,
    name,
    role,
    profileId,
    profileModel
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact administrator.'
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  await user.updateLastLogin();

  const token = user.getSignedJwtToken();

  let profile = null;
  if (user.role === 'student' && user.profileId) {
    profile = await Student.findByPk(user.profileId, {
      include: [
        { model: Program, as: 'program', attributes: ['name', 'code'] },
        { model: Department, as: 'department', attributes: ['name', 'code'] }
      ]
    });
  } else if (user.role === 'faculty' && user.profileId) {
    profile = await Faculty.findByPk(user.profileId, {
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] }
      ]
    });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile
      },
      token
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  let profile = null;
  if (user.role === 'student' && user.profileId) {
    profile = await Student.findByPk(user.profileId, {
      include: [
        { model: Program, as: 'program', attributes: ['name', 'code'] },
        { model: Department, as: 'department', attributes: ['name', 'code'] }
      ]
    });
  } else if (user.role === 'faculty' && user.profileId) {
    profile = await Faculty.findByPk(user.profileId, {
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] }
      ]
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        profile
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, address, dateOfBirth, bloodGroup, emergencyContact } = req.body;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  await User.update(updateData, { where: { id: req.user.id }, individualHooks: true });
  const user = await User.findByPk(req.user.id);

  if (req.user.role === 'student' && req.user.profileId) {
    const studentUpdate = {};
    if (email) studentUpdate.email = email;
    if (name) studentUpdate.name = name;
    if (phone) studentUpdate.phone = phone;
    if (dateOfBirth) studentUpdate.dateOfBirth = dateOfBirth;
    if (bloodGroup) studentUpdate.bloodGroup = bloodGroup;
    if (address) {
      if (address.street) studentUpdate.addressStreet = address.street;
      if (address.city) studentUpdate.addressCity = address.city;
      if (address.state) studentUpdate.addressState = address.state;
      if (address.pincode) studentUpdate.addressPincode = address.pincode;
    }

    await Student.update(studentUpdate, { where: { id: req.user.profileId } });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.scope('withPassword').findByPk(req.user.id);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10, search } = req.query;

  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: users } = await User.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: users
  });
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body;

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  await user.update(updateData);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUser,
  deleteUser
};
