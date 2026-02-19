/**
 * Announcement Model (Sequelize - PostgreSQL)
 * Stores announcements/notifications for users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('General', 'Academic', 'Exam', 'Event', 'Holiday', 'Urgent', 'Other'),
    defaultValue: 'General'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Normal', 'High', 'Urgent'),
    defaultValue: 'Normal'
  },
  // Store target roles as JSON array
  targetRoles: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const val = this.getDataValue('targetRoles');
      return val || [];
    }
  },
  // Store target department IDs as JSON array
  targetDepartments: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const val = this.getDataValue('targetDepartments');
      return val || [];
    }
  },
  // Store target program IDs as JSON array
  targetPrograms: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const val = this.getDataValue('targetPrograms');
      return val || [];
    }
  },
  // Store attachments as JSON array
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const val = this.getDataValue('attachments');
      return val || [];
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  publishDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'announcements',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive', 'publishDate']
    },
    {
      fields: ['category', 'priority']
    }
  ]
});

module.exports = Announcement;
