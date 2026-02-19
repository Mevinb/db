/**
 * Department Model (Sequelize - PostgreSQL)
 * Represents academic departments in the college
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('code', value ? value.toUpperCase().trim() : value);
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  headOfDepartment: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'departments',
  timestamps: true
});

module.exports = Department;
