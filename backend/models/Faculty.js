/**
 * Faculty Model
 * Represents faculty members/teachers
 * References: department, user
 * Referenced by: courses, attendance
 */

const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'],
    required: [true, 'Designation is required']
  },
  specialization: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  // Reference to user account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for courses taught by this faculty
facultySchema.virtual('coursesTaught', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'faculty',
  justOne: false
});

module.exports = mongoose.model('Faculty', facultySchema);
