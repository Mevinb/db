/**
 * Faculty Ownership Middleware & Helpers
 * Ensures faculty members can only access/modify data for courses assigned to them.
 * Admins bypass all ownership checks.
 */

const { Course, Exam } = require('../models');

/**
 * Get the IDs of all courses assigned to the logged-in faculty member.
 * Returns all course IDs if the user is an admin.
 * @param {object} user - req.user (User model instance)
 * @returns {Promise<number[]>} Array of course IDs
 */
async function getFacultyCourseIds(user) {
  if (user.role === 'admin') return null; // null means "no filtering needed"

  if (user.role !== 'faculty' || !user.profileId) return [];

  const courses = await Course.findAll({
    where: { facultyId: user.profileId },
    attributes: ['id'],
    raw: true,
  });

  return courses.map(c => c.id);
}

/**
 * Verify that a specific course belongs to the logged-in faculty.
 * Admins always pass.
 * @param {object} user - req.user
 * @param {number} courseId - The course ID to check
 * @returns {Promise<boolean>}
 */
async function facultyOwnsCourse(user, courseId) {
  if (user.role === 'admin') return true;
  if (user.role !== 'faculty' || !user.profileId) return false;

  const course = await Course.findOne({
    where: { id: courseId, facultyId: user.profileId },
    attributes: ['id'],
  });

  return !!course;
}

/**
 * Verify that a specific exam belongs to a course owned by the logged-in faculty.
 * Admins always pass.
 * @param {object} user - req.user
 * @param {number} examId - The exam ID to check
 * @returns {Promise<boolean>}
 */
async function facultyOwnsExam(user, examId) {
  if (user.role === 'admin') return true;
  if (user.role !== 'faculty' || !user.profileId) return false;

  const exam = await Exam.findByPk(examId, {
    include: [{
      model: Course,
      as: 'course',
      attributes: ['id', 'facultyId'],
    }],
    attributes: ['id'],
  });

  if (!exam || !exam.course) return false;
  return exam.course.facultyId === user.profileId;
}

module.exports = {
  getFacultyCourseIds,
  facultyOwnsCourse,
  facultyOwnsExam,
};
