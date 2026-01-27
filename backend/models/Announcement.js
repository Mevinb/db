/**
 * Announcement Model
 * Stores announcements/notifications for users
 * References: createdBy (User)
 */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'Academic', 'Exam', 'Event', 'Holiday', 'Urgent', 'Other'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  // Target audience
  targetRoles: [{
    type: String,
    enum: ['admin', 'faculty', 'student']
  }],
  // Optional: target specific departments or programs
  targetDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  targetPrograms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }],
  // Attachments (file URLs)
  attachments: [{
    name: String,
    url: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
announcementSchema.index({ isActive: 1, publishDate: -1 });
announcementSchema.index({ targetRoles: 1 });
announcementSchema.index({ category: 1, priority: 1 });

// Static method to get active announcements for a role
announcementSchema.statics.getActiveForRole = async function(role, departmentId = null) {
  const query = {
    isActive: true,
    publishDate: { $lte: new Date() },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gte: new Date() } }
    ],
    $or: [
      { targetRoles: { $size: 0 } },
      { targetRoles: role }
    ]
  };
  
  if (departmentId) {
    query.$or.push(
      { targetDepartments: { $size: 0 } },
      { targetDepartments: departmentId }
    );
  }
  
  return this.find(query)
    .populate('createdBy', 'name')
    .sort({ isPinned: -1, publishDate: -1 });
};

module.exports = mongoose.model('Announcement', announcementSchema);
