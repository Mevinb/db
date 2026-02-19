/**
 * Exam Model (Sequelize - PostgreSQL)
 * Represents exams/assessments for courses
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
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
  type: {
    type: DataTypes.ENUM('Quiz', 'Assignment', 'Mid-Term', 'End-Term', 'Lab', 'Project', 'Viva', 'Practical'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Internal', 'External'),
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  weightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'exams',
  timestamps: true,
  validate: {
    passingMarksValid() {
      if (this.passingMarks > this.maxMarks) {
        throw new Error('Passing marks cannot exceed maximum marks');
      }
    }
  }
});

module.exports = Exam;
