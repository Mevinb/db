/**
 * Department Model
 * Represents academic departments in the college
 * Referenced by: programs, faculty, courses
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  establishedYear: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting programs in this department
departmentSchema.virtual('programs', {
  ref: 'Program',
  localField: '_id',
  foreignField: 'department',
  justOne: false
});

// Virtual for getting faculty in this department
departmentSchema.virtual('facultyMembers', {
  ref: 'Faculty',
  localField: '_id',
  foreignField: 'department',
  justOne: false
});

// Virtual for getting courses in this department
departmentSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'department',
  justOne: false
});

module.exports = mongoose.model('Department', departmentSchema);
