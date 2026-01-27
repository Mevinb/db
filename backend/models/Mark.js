/**
 * Mark Model
 * Stores marks obtained by students in exams
 * References: student, course, exam
 */

const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
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
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam is required']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: [0, 'Marks cannot be negative']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required']
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String
  },
  isPassed: {
    type: Boolean
  },
  remarks: {
    type: String,
    trim: true
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound unique index - one mark record per student per exam
markSchema.index({ student: 1, exam: 1 }, { unique: true });

// Index for queries
markSchema.index({ course: 1, exam: 1 });
markSchema.index({ student: 1, course: 1 });

// Pre-save hook to calculate percentage and determine pass/fail
markSchema.pre('save', async function(next) {
  // Calculate percentage
  this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100);
  
  // Determine pass/fail
  const Exam = mongoose.model('Exam');
  const exam = await Exam.findById(this.exam);
  if (exam) {
    this.isPassed = this.marksObtained >= exam.passingMarks;
  }
  
  // Calculate grade based on percentage
  this.grade = this.calculateGrade();
  
  next();
});

// Method to calculate grade
markSchema.methods.calculateGrade = function() {
  const p = this.percentage;
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C+';
  if (p >= 45) return 'C';
  if (p >= 40) return 'D';
  return 'F';
};

// Static method to update enrollment marks
markSchema.statics.updateEnrollmentMarks = async function(studentId, courseId) {
  const Exam = mongoose.model('Exam');
  const Enrollment = mongoose.model('Enrollment');
  
  // Get all marks for this student-course combination
  const marks = await this.find({ student: studentId, course: courseId }).populate('exam');
  
  let internalMarks = 0;
  let externalMarks = 0;
  
  marks.forEach(mark => {
    if (mark.exam && mark.isPublished) {
      if (mark.exam.category === 'Internal') {
        internalMarks += mark.marksObtained;
      } else {
        externalMarks += mark.marksObtained;
      }
    }
  });
  
  const totalMarks = internalMarks + externalMarks;
  
  await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { internalMarks, externalMarks, totalMarks }
  );
};

// Update enrollment marks after save
markSchema.post('save', async function() {
  await this.constructor.updateEnrollmentMarks(this.student, this.course);
});

module.exports = mongoose.model('Mark', markSchema);
