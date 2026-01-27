/**
 * Attendance Model
 * Tracks daily attendance for students in courses
 * References: student, course, faculty (who marked)
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: [true, 'Status is required']
  },
  // Multiple sessions per day (for labs, etc.)
  session: {
    type: Number,
    default: 1,
    min: [1, 'Session must be at least 1']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Marked by faculty is required']
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound unique index - one record per student per course per date per session
attendanceSchema.index({ student: 1, course: 1, date: 1, session: 1 }, { unique: true });

// Index for quick queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

// Static method to calculate attendance percentage
attendanceSchema.statics.calculateAttendance = async function(studentId, courseId) {
  const total = await this.countDocuments({ student: studentId, course: courseId });
  const present = await this.countDocuments({
    student: studentId,
    course: courseId,
    status: { $in: ['Present', 'Late'] }
  });
  
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

// Update enrollment attendance percentage after save
attendanceSchema.post('save', async function() {
  const Enrollment = mongoose.model('Enrollment');
  const percentage = await this.constructor.calculateAttendance(this.student, this.course);
  
  await Enrollment.findOneAndUpdate(
    { student: this.student, course: this.course },
    { attendancePercentage: percentage }
  );
});

module.exports = mongoose.model('Attendance', attendanceSchema);
