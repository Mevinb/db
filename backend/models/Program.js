/**
 * Program Model
 * Represents academic programs (B.Tech, M.Tech, MBA, etc.)
 * References: department
 * Referenced by: students, courses
 */

const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Program code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [15, 'Code cannot exceed 15 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  duration: {
    type: Number,
    required: [true, 'Program duration is required'],
    min: [1, 'Duration must be at least 1 year'],
    max: [6, 'Duration cannot exceed 6 years']
  },
  degreeType: {
    type: String,
    enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'],
    required: [true, 'Degree type is required']
  },
  totalCredits: {
    type: Number,
    required: [true, 'Total credits is required'],
    min: [0, 'Credits cannot be negative']
  },
  totalSemesters: {
    type: Number,
    required: [true, 'Total semesters is required'],
    min: [1, 'Must have at least 1 semester']
  },
  description: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  fees: {
    type: Number,
    min: [0, 'Fees cannot be negative']
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

// Compound unique index for name + department
programSchema.index({ name: 1, department: 1 }, { unique: true });

// Virtual for students in this program
programSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'program',
  justOne: false
});

// Virtual for courses in this program
programSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'program',
  justOne: false
});

module.exports = mongoose.model('Program', programSchema);
