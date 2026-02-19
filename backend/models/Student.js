/**
 * Student Model (Sequelize - PostgreSQL)
 * Represents enrolled students
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('rollNumber', value ? value.toUpperCase().trim() : value);
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    set(value) {
      this.setDataValue('email', value ? value.toLowerCase().trim() : value);
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'programs',
      key: 'id'
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
  currentSemester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  admissionYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  batchYear: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  addressStreet: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressCity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressState: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressPincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianRelation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cgpa: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  },
  totalCreditsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Graduated', 'Dropped', 'Suspended'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;
