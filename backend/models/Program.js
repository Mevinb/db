/**
 * Program Model (Sequelize - PostgreSQL)
 * Represents academic programs (B.Tech, M.Tech, MBA, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Program = sequelize.define('Program', {
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
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
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
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6
    }
  },
  degreeType: {
    type: DataTypes.ENUM('Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'),
    allowNull: false
  },
  totalCredits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalSemesters: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'programs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'departmentId']
    }
  ]
});

module.exports = Program;
