/**
 * Semester Model (Sequelize - PostgreSQL)
 * Represents academic semesters/terms
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Semester = sequelize.define('Semester', {
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
    unique: true,
    set(value) {
      this.setDataValue('code', value ? value.toUpperCase().trim() : value);
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\d{4}-\d{4}$/
    }
  },
  semesterNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]]
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  registrationStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  registrationEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed'),
    defaultValue: 'Upcoming'
  }
}, {
  tableName: 'semesters',
  timestamps: true,
  validate: {
    endDateAfterStart() {
      if (this.endDate && this.startDate && this.endDate <= this.startDate) {
        throw new Error('End date must be after start date');
      }
    }
  }
});

module.exports = Semester;
