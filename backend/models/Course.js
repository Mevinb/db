/**
 * Course Model (Sequelize - PostgreSQL)
 * Represents academic courses/subjects
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('code', value ? value.toUpperCase().trim() : value);
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'programs',
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
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  semesterNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  type: {
    type: DataTypes.ENUM('Core', 'Elective', 'Lab', 'Project', 'Seminar'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  syllabus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lectureHours: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  tutorialHours: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  practicalHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  internalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  externalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  currentEnrollment: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code', 'semesterId']
    }
  ]
});

module.exports = Course;
