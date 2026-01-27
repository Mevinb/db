/**
 * Controllers Index
 * Central export for all controllers
 */

module.exports = {
  authController: require('./authController'),
  departmentController: require('./departmentController'),
  programController: require('./programController'),
  facultyController: require('./facultyController'),
  studentController: require('./studentController'),
  semesterController: require('./semesterController'),
  courseController: require('./courseController'),
  enrollmentController: require('./enrollmentController'),
  attendanceController: require('./attendanceController'),
  examController: require('./examController'),
  markController: require('./markController'),
  announcementController: require('./announcementController'),
  dashboardController: require('./dashboardController')
};
