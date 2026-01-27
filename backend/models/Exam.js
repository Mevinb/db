/**
 * Exam Model
 * Represents exams/assessments for courses
 * References: course, semester
 * Referenced by: marks
 */

const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  type: {
    type: String,
    enum: ['Quiz', 'Assignment', 'Mid-Term', 'End-Term', 'Lab', 'Project', 'Viva', 'Practical'],
    required: [true, 'Exam type is required']
  },
  category: {
    type: String,
    enum: ['Internal', 'External'],
    required: [true, 'Category is required']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be at least 1']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    min: [0, 'Passing marks cannot be negative']
  },
  weightage: {
    type: Number,
    min: [0, 'Weightage cannot be negative'],
    max: [100, 'Weightage cannot exceed 100']
  },
  date: {
    type: Date
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute']
  },
  venue: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validate passing marks doesn't exceed max marks
examSchema.pre('validate', function(next) {
  if (this.passingMarks > this.maxMarks) {
    this.invalidate('passingMarks', 'Passing marks cannot exceed maximum marks');
  }
  next();
});

// Virtual for marks in this exam
examSchema.virtual('marks', {
  ref: 'Mark',
  localField: '_id',
  foreignField: 'exam',
  justOne: false
});

module.exports = mongoose.model('Exam', examSchema);
