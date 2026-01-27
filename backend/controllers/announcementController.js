/**
 * Announcement Controller
 * CRUD operations for announcements
 */

const Announcement = require('../models/Announcement');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Private
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    priority, 
    isActive,
    role 
  } = req.query;

  const query = {};
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  // Filter by target role if specified
  if (role) {
    query.$or = [
      { targetRoles: { $size: 0 } },
      { targetRoles: role }
    ];
  }

  const total = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('createdBy', 'name')
    .populate('targetDepartments', 'name')
    .populate('targetPrograms', 'name')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ isPinned: -1, publishDate: -1 });

  res.status(200).json({
    success: true,
    count: announcements.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: announcements
  });
});

/**
 * @desc    Get active announcements for current user
 * @route   GET /api/announcements/active
 * @access  Private
 */
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const now = new Date();

  const query = {
    isActive: true,
    publishDate: { $lte: now },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gte: now } }
    ]
  };

  // Filter by role
  query.$and = [
    {
      $or: [
        { targetRoles: { $size: 0 } },
        { targetRoles: userRole }
      ]
    }
  ];

  const announcements = await Announcement.find(query)
    .populate('createdBy', 'name')
    .sort({ isPinned: -1, publishDate: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
});

/**
 * @desc    Get single announcement
 * @route   GET /api/announcements/:id
 * @access  Private
 */
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('targetDepartments', 'name code')
    .populate('targetPrograms', 'name code');

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Increment view count
  announcement.views += 1;
  await announcement.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: announcement
  });
});

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 * @access  Private/Admin
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;

  const announcement = await Announcement.create(req.body);

  const populatedAnnouncement = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: populatedAnnouncement
  });
});

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Private/Admin
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: announcement
  });
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private/Admin
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

/**
 * @desc    Toggle pin announcement
 * @route   PUT /api/announcements/:id/toggle-pin
 * @access  Private/Admin
 */
const togglePin = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  announcement.isPinned = !announcement.isPinned;
  await announcement.save();

  res.status(200).json({
    success: true,
    message: announcement.isPinned ? 'Announcement pinned' : 'Announcement unpinned',
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
