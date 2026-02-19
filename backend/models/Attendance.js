/**
 * Attendance Model (Sequelize - PostgreSQL)
 * Tracks daily attendance for students in courses
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Excused'),
    allowNull: false
  },
  session: {
    type: DataTypes.STRING,
    defaultValue: 'Morning'
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'courseId', 'date', 'session']
    },
    {
      fields: ['courseId', 'date']
    },
    {
      fields: ['studentId', 'date']
    }
  ]
});

// Static method to calculate attendance percentage
Attendance.calculateAttendance = async function(studentId, courseId) {
  const { Op } = require('sequelize');
  const total = await this.count({ where: { studentId, courseId } });
  const present = await this.count({
    where: {
      studentId,
      courseId,
      status: { [Op.in]: ['Present', 'Late'] }
    }
  });
  
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

module.exports = Attendance;
