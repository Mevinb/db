/**
 * Announcement Controller
 * CRUD operations for announcements
 */

const { Op } = require('sequelize');
const { Announcement, Faculty, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, type, priority, isActive } = req.query;

  const where = {};
  if (type) where.type = type;
  if (priority) where.priority = priority;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count: total, rows: announcements } = await Announcement.findAndCountAll({
    where,
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email', 'role'] }
    ],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: announcements.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: announcements
  });
});

const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const { role, department, program } = req.query;
  const now = new Date();

  const where = {
    isActive: true,
    [Op.or]: [
      { publishDate: null },
      { publishDate: { [Op.lte]: now } }
    ]
  };

  // expiryDate check: null or >= now
  where[Op.and] = [
    {
      [Op.or]: [
        { expiryDate: null },
        { expiryDate: { [Op.gte]: now } }
      ]
    }
  ];

  const announcements = await Announcement.findAll({
    where,
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email', 'role'] }
    ],
    order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
  });

  // Filter by targetRoles, targetDepartments, targetPrograms in application layer
  // since these are JSON columns
  let filtered = announcements;
  if (role) {
    filtered = filtered.filter(a => {
      if (!a.targetRoles || a.targetRoles.length === 0) return true;
      return a.targetRoles.includes(role);
    });
  }
  if (department) {
    filtered = filtered.filter(a => {
      if (!a.targetDepartments || a.targetDepartments.length === 0) return true;
      return a.targetDepartments.includes(parseInt(department));
    });
  }
  if (program) {
    filtered = filtered.filter(a => {
      if (!a.targetPrograms || a.targetPrograms.length === 0) return true;
      return a.targetPrograms.includes(parseInt(program));
    });
  }

  res.status(200).json({ success: true, count: filtered.length, data: filtered });
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email', 'role'] }
    ]
  });

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  res.status(200).json({ success: true, data: announcement });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  req.body.createdBy = req.body.createdBy || req.user?.id;

  const announcement = await Announcement.create(req.body);

  const populated = await Announcement.findByPk(announcement.id, {
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email', 'role'] }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: populated
  });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  let announcement = await Announcement.findByPk(req.params.id);

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  await announcement.update(req.body);

  announcement = await Announcement.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['name', 'email', 'role'] }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: announcement
  });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  await announcement.destroy();

  res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
});

const togglePin = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  await announcement.update({ isPinned: !announcement.isPinned });

  res.status(200).json({
    success: true,
    message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: announcement
  });
});

module.exports = {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin
};
