/**
 * Course Model
 * Represents academic courses/subjects
 * References: department, program, semester, faculty
 * Referenced by: enrollments, attendance, exams, marks
 */

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    uppercase: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  // Course for which semester of the program (1-8 for B.Tech, etc.)
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: [1, 'Semester number must be at least 1']
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  type: {
    type: String,
    enum: ['Core', 'Elective', 'Lab', 'Project', 'Seminar'],
    required: [true, 'Course type is required']
  },
  description: {
    type: String,
    trim: true
  },
  syllabus: {
    type: String,
    trim: true
  },
  // Hours per week
  lectureHours: {
    type: Number,
    default: 3
  },
  tutorialHours: {
    type: Number,
    default: 1
  },
  practicalHours: {
    type: Number,
    default: 0
  },
  // Evaluation scheme
  internalMarks: {
    type: Number,
    default: 40
  },
  externalMarks: {
    type: Number,
    default: 60
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 40
  },
  maxCapacity: {
    type: Number,
    default: 60
  },
  currentEnrollment: {
    type: Number,
    default: 0
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

// Compound unique index for code + semester
courseSchema.index({ code: 1, semester: 1 }, { unique: true });

// Virtual for enrollments in this course
courseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual for attendance records
courseSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual for exams
courseSchema.virtual('exams', {
  ref: 'Exam',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

module.exports = mongoose.model('Course', courseSchema);
