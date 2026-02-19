/**
 * Faculty Model (Sequelize - PostgreSQL)
 * Represents faculty members/teachers
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('employeeId', value ? value.toUpperCase().trim() : value);
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
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  designation: {
    type: DataTypes.ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'),
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
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
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'faculties',
  timestamps: true
});

module.exports = Faculty;
