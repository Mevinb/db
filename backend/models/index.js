/**
 * Models Index
 * Central export for all Sequelize models with associations
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

// ============================================
// ASSOCIATIONS
// ============================================

// Department <-> Faculty (HOD)
Department.belongsTo(Faculty, { as: 'hod', foreignKey: 'headOfDepartment' });

// Program <-> Department
Program.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(Program, { as: 'programs', foreignKey: 'departmentId' });

// Faculty <-> Department
Faculty.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(Faculty, { as: 'facultyMembers', foreignKey: 'departmentId' });

// Faculty <-> User
Faculty.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Student <-> Program
Student.belongsTo(Program, { as: 'program', foreignKey: 'programId' });
Program.hasMany(Student, { as: 'students', foreignKey: 'programId' });

// Student <-> Department
Student.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(Student, { as: 'students', foreignKey: 'departmentId' });

// Student <-> User
Student.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Course <-> Department
Course.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });
Department.hasMany(Course, { as: 'courses', foreignKey: 'departmentId' });

// Course <-> Program
Course.belongsTo(Program, { as: 'program', foreignKey: 'programId' });
Program.hasMany(Course, { as: 'courses', foreignKey: 'programId' });

// Course <-> Semester
Course.belongsTo(Semester, { as: 'semester', foreignKey: 'semesterId' });
Semester.hasMany(Course, { as: 'courses', foreignKey: 'semesterId' });

// Course <-> Faculty
Course.belongsTo(Faculty, { as: 'faculty', foreignKey: 'facultyId' });
Faculty.hasMany(Course, { as: 'coursesTaught', foreignKey: 'facultyId' });

// Enrollment <-> Student
Enrollment.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Student.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'studentId' });

// Enrollment <-> Course
Enrollment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId' });

// Enrollment <-> Semester
Enrollment.belongsTo(Semester, { as: 'semester', foreignKey: 'semesterId' });
Semester.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'semesterId' });

// Attendance <-> Student
Attendance.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Student.hasMany(Attendance, { as: 'attendanceRecords', foreignKey: 'studentId' });

// Attendance <-> Course
Attendance.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(Attendance, { as: 'attendanceRecords', foreignKey: 'courseId' });

// Attendance <-> Faculty (markedBy)
Attendance.belongsTo(Faculty, { as: 'markedByFaculty', foreignKey: 'markedBy' });

// Exam <-> Course
Exam.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(Exam, { as: 'exams', foreignKey: 'courseId' });

// Exam <-> Semester
Exam.belongsTo(Semester, { as: 'semester', foreignKey: 'semesterId' });
Semester.hasMany(Exam, { as: 'exams', foreignKey: 'semesterId' });

// Mark <-> Student
Mark.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Student.hasMany(Mark, { as: 'marks', foreignKey: 'studentId' });

// Mark <-> Course
Mark.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

// Mark <-> Exam
Mark.belongsTo(Exam, { as: 'exam', foreignKey: 'examId' });
Exam.hasMany(Mark, { as: 'marks', foreignKey: 'examId' });

// Mark <-> Faculty (enteredBy)
Mark.belongsTo(Faculty, { as: 'enteredByFaculty', foreignKey: 'enteredBy' });

// Announcement <-> User (createdBy)
Announcement.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

const { sequelize } = require('../config/db');

// Automatically add 'id' to all include attributes so nested models always have id/_id
sequelize.addHook('beforeFind', (options) => {
  const addIdToIncludes = (includes) => {
    if (!includes) return;
    includes.forEach(inc => {
      if (inc.attributes && Array.isArray(inc.attributes) && !inc.attributes.includes('id')) {
        inc.attributes.unshift('id');
      }
      if (inc.include) {
        addIdToIncludes(inc.include);
      }
    });
  };
  addIdToIncludes(options.include);
});

// After find, recursively inject _id into all nested model instances
sequelize.addHook('afterFind', (results) => {
  if (!results) return;

  const addIdField = (instance) => {
    if (!instance || !instance.dataValues) return;
    if (instance.dataValues.id !== undefined && instance.dataValues._id === undefined) {
      instance.dataValues._id = String(instance.dataValues.id);
    }
    // Recurse into associations
    for (const key of Object.keys(instance.dataValues)) {
      const val = instance.dataValues[key];
      if (val && typeof val === 'object') {
        if (val.dataValues) {
          addIdField(val);
        } else if (Array.isArray(val)) {
          val.forEach(item => { if (item && item.dataValues) addIdField(item); });
        }
      }
    }
  };

  if (Array.isArray(results)) {
    results.forEach(addIdField);
  } else {
    addIdField(results);
  }
});

// Add _id virtual to all models for frontend compatibility (MongoDB migration)
// Uses dataValues to get id even when attributes list doesn't include 'id'
const allModels = [User, Department, Program, Faculty, Student, Semester, Course, Enrollment, Attendance, Exam, Mark, Announcement];
allModels.forEach(Model => {
  const originalToJSON = Model.prototype.toJSON;
  Model.prototype.toJSON = function() {
    const values = originalToJSON ? originalToJSON.call(this) : { ...this.get() };
    // dataValues always has the id even when not in the attributes list
    const id = this.dataValues ? this.dataValues.id : values.id;
    if (id !== undefined) {
      values._id = String(id);
      if (values.id === undefined) values.id = id;
    }
    return values;
  };
});

module.exports = {
  sequelize,
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
