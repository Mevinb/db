/**
 * Models Index
 * Central export for all Mongoose models
 */

const User = require('./User');
const Department = require('./Department');
const Program = require('./Program');
const Faculty = require('./Faculty');
const Student = require('./Student');
const Semester = require('./Semester');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Attendance = require('./Attendance');
const Exam = require('./Exam');
const Mark = require('./Mark');
const Announcement = require('./Announcement');

module.exports = {
  User,
  Department,
  Program,
  Faculty,
  Student,
  Semester,
  Course,
  Enrollment,
  Attendance,
  Exam,
  Mark,
  Announcement
};
