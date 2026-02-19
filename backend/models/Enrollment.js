/**
 * Enrollment Model (Sequelize - PostgreSQL)
 * Represents student course enrollments (Many-to-Many relationship)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
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
  semesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Enrolled', 'Dropped', 'Completed', 'Withdrawn'),
    defaultValue: 'Enrolled'
  },
  grade: {
    type: DataTypes.ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W'),
    allowNull: true
  },
  gradePoints: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 10
    }
  },
  attendancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  internalMarks: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  externalMarks: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  totalMarks: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'courseId', 'semesterId']
    }
  ]
});

// Instance method to calculate grade points
Enrollment.prototype.calculateGradePoints = function() {
  const gradePointMap = {
    'A+': 10, 'A': 9, 'B+': 8, 'B': 7,
    'C+': 6, 'C': 5, 'D': 4, 'F': 0,
    'I': 0, 'W': 0
  };
  return gradePointMap[this.grade] || 0;
};

module.exports = Enrollment;
