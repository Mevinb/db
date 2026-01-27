/**
 * Enrollment Model
 * Represents student course enrollments (Many-to-Many relationship)
 * References: student, course, semester
 */

const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Enrolled', 'Dropped', 'Completed', 'Withdrawn'],
    default: 'Enrolled'
  },
  // Grade after course completion
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W', null],
    default: null
  },
  gradePoints: {
    type: Number,
    min: [0, 'Grade points cannot be negative'],
    max: [10, 'Grade points cannot exceed 10']
  },
  // Attendance summary for quick access
  attendancePercentage: {
    type: Number,
    min: [0, 'Attendance cannot be negative'],
    max: [100, 'Attendance cannot exceed 100'],
    default: 0
  },
  // Internal marks summary
  internalMarks: {
    type: Number,
    default: 0
  },
  externalMarks: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound unique index - student can only enroll once per course per semester
enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Update course enrollment count on save
enrollmentSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const count = await this.constructor.countDocuments({
    course: this.course,
    status: 'Enrolled'
  });
  await Course.findByIdAndUpdate(this.course, { currentEnrollment: count });
});

// Update course enrollment count on delete
enrollmentSchema.post('remove', async function() {
  const Course = mongoose.model('Course');
  const count = await this.constructor.countDocuments({
    course: this.course,
    status: 'Enrolled'
  });
  await Course.findByIdAndUpdate(this.course, { currentEnrollment: count });
});

// Convert grade to grade points
enrollmentSchema.methods.calculateGradePoints = function() {
  const gradePointMap = {
    'A+': 10, 'A': 9, 'B+': 8, 'B': 7,
    'C+': 6, 'C': 5, 'D': 4, 'F': 0,
    'I': 0, 'W': 0
  };
  return gradePointMap[this.grade] || 0;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
