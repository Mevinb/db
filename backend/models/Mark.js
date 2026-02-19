/**
 * Mark Model (Sequelize - PostgreSQL)
 * Stores marks obtained by students in exams
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Mark = sequelize.define('Mark', {
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
  examId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id'
    }
  },
  marksObtained: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxMarks: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  enteredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'marks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'examId']
    },
    {
      fields: ['courseId', 'examId']
    },
    {
      fields: ['studentId', 'courseId']
    }
  ],
  hooks: {
    beforeSave: async (mark) => {
      // Calculate percentage
      mark.percentage = Math.round((mark.marksObtained / mark.maxMarks) * 100);
      
      // Calculate grade based on percentage
      const p = mark.percentage;
      if (p >= 90) mark.grade = 'A+';
      else if (p >= 80) mark.grade = 'A';
      else if (p >= 70) mark.grade = 'B+';
      else if (p >= 60) mark.grade = 'B';
      else if (p >= 50) mark.grade = 'C+';
      else if (p >= 45) mark.grade = 'C';
      else if (p >= 40) mark.grade = 'D';
      else mark.grade = 'F';

      // Determine pass/fail using exam's passing marks
      try {
        const Exam = require('./Exam');
        const exam = await Exam.findByPk(mark.examId);
        if (exam) {
          mark.isPassed = mark.marksObtained >= exam.passingMarks;
        }
      } catch (e) {
        // If exam not found, skip
      }
    }
  }
});

module.exports = Mark;
