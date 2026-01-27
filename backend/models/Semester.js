/**
 * Semester Model
 * Represents academic semesters/terms
 * Referenced by: courses, enrollments, exams
 */

const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Semester code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)']
  },
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    enum: [1, 2], // 1 for Odd/Fall, 2 for Even/Spring
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationStartDate: {
    type: Date
  },
  registrationEndDate: {
    type: Date
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one semester is marked as current
semesterSchema.pre('save', async function(next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

// Validate end date is after start date
semesterSchema.pre('validate', function(next) {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Virtual for courses in this semester
semesterSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'semester',
  justOne: false
});

// Virtual for exams in this semester
semesterSchema.virtual('exams', {
  ref: 'Exam',
  localField: '_id',
  foreignField: 'semester',
  justOne: false
});

module.exports = mongoose.model('Semester', semesterSchema);
