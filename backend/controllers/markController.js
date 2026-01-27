/**
 * Mark Controller
 * CRUD operations for marks
 */

const Mark = require('../models/Mark');
const Exam = require('../models/Exam');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all marks
 * @route   GET /api/marks
 * @access  Private
 */
const getMarks = asyncHandler(async (req, res) => {
  const { student, course, exam, isPublished } = req.query;

  const query = {};
  if (student) query.student = student;
  if (course) query.course = course;
  if (exam) query.exam = exam;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';

  const marks = await Mark.find(query)
    .populate('student', 'name rollNumber')
    .populate('course', 'name code')
    .populate('exam', 'name type category maxMarks')
    .populate('enteredBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: marks.length,
    data: marks
  });
});

/**
 * @desc    Get marks for an exam
 * @route   GET /api/marks/exam/:examId
 * @access  Private
 */
const getExamMarks = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId).populate('course');
  
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Get all enrolled students
  const Enrollment = require('../models/Enrollment');
  const enrollments = await Enrollment.find({
    course: exam.course._id,
    status: 'Enrolled'
  }).populate('student', 'name rollNumber email');

  // Get marks
  const marks = await Mark.find({ exam: req.params.examId });
  const marksMap = {};
  marks.forEach(mark => {
    marksMap[mark.student.toString()] = mark;
  });

  // Combine data
  const data = enrollments.map(enrollment => {
    const mark = marksMap[enrollment.student._id.toString()];
    return {
      student: enrollment.student,
      marksObtained: mark ? mark.marksObtained : null,
      maxMarks: exam.maxMarks,
      percentage: mark ? mark.percentage : null,
      grade: mark ? mark.grade : null,
      isPassed: mark ? mark.isPassed : null,
      markId: mark ? mark._id : null
    };
  });

  res.status(200).json({
    success: true,
    exam: {
      id: exam._id,
      name: exam.name,
      type: exam.type,
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks
    },
    count: data.length,
    data
  });
});

/**
 * @desc    Enter single mark
 * @route   POST /api/marks
 * @access  Private/Faculty
 */
const enterMark = asyncHandler(async (req, res) => {
  const { student, course, exam, marksObtained, remarks } = req.body;

  // Get exam details for max marks
  const examDoc = await Exam.findById(exam);
  if (!examDoc) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Check if mark already exists
  let mark = await Mark.findOne({ student, exam });

  if (mark) {
    // Update existing mark
    mark.marksObtained = marksObtained;
    mark.maxMarks = examDoc.maxMarks;
    mark.remarks = remarks;
    mark.enteredBy = req.user.profileId || req.user._id;
    await mark.save();
  } else {
    // Create new mark
    mark = await Mark.create({
      student,
      course,
      exam,
      marksObtained,
      maxMarks: examDoc.maxMarks,
      remarks,
      enteredBy: req.user.profileId || req.user._id
    });
  }

  const populatedMark = await Mark.findById(mark._id)
    .populate('student', 'name rollNumber')
    .populate('exam', 'name type');

  res.status(201).json({
    success: true,
    message: 'Mark entered successfully',
    data: populatedMark
  });
});

/**
 * @desc    Enter bulk marks for an exam
 * @route   POST /api/marks/bulk
 * @access  Private/Faculty
 */
const enterBulkMarks = asyncHandler(async (req, res) => {
  const { exam, course, marks: marksData } = req.body;

  const examDoc = await Exam.findById(exam);
  if (!examDoc) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const results = {
    success: 0,
    updated: 0,
    failed: 0
  };

  for (const data of marksData) {
    try {
      let mark = await Mark.findOne({
        student: data.student,
        exam
      });

      if (mark) {
        mark.marksObtained = data.marksObtained;
        mark.maxMarks = examDoc.maxMarks;
        mark.remarks = data.remarks || '';
        mark.enteredBy = req.user.profileId || req.user._id;
        await mark.save();
        results.updated++;
      } else {
        await Mark.create({
          student: data.student,
          course,
          exam,
          marksObtained: data.marksObtained,
          maxMarks: examDoc.maxMarks,
          remarks: data.remarks || '',
          enteredBy: req.user.profileId || req.user._id
        });
        results.success++;
      }
    } catch (error) {
      console.error('Error entering mark:', error);
      results.failed++;
    }
  }

  res.status(201).json({
    success: true,
    message: `Marks entered: ${results.success} new, ${results.updated} updated, ${results.failed} failed`,
    data: results
  });
});

/**
 * @desc    Update mark
 * @route   PUT /api/marks/:id
 * @access  Private/Faculty
 */
const updateMark = asyncHandler(async (req, res) => {
  let mark = await Mark.findById(req.params.id);

  if (!mark) {
    return res.status(404).json({
      success: false,
      message: 'Mark not found'
    });
  }

  mark = await Mark.findByIdAndUpdate(
    req.params.id,
    { ...req.body, enteredBy: req.user.profileId || req.user._id },
    { new: true, runValidators: true }
  )
    .populate('student', 'name rollNumber')
    .populate('exam', 'name type');

  res.status(200).json({
    success: true,
    message: 'Mark updated successfully',
    data: mark
  });
});

/**
 * @desc    Delete mark
 * @route   DELETE /api/marks/:id
 * @access  Private/Admin
 */
const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findById(req.params.id);

  if (!mark) {
    return res.status(404).json({
      success: false,
      message: 'Mark not found'
    });
  }

  await mark.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Mark deleted successfully'
  });
});

/**
 * @desc    Get student grades summary
 * @route   GET /api/marks/student/:studentId/summary
 * @access  Private
 */
const getStudentGradesSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { semester } = req.query;

  const Enrollment = require('../models/Enrollment');
  
  const enrollmentQuery = { student: studentId };
  if (semester) {
    enrollmentQuery.semester = semester;
  }

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('course', 'name code credits')
    .populate('semester', 'name code');

  const summary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const marks = await Mark.find({
        student: studentId,
        course: enrollment.course._id,
        isPublished: true
      }).populate('exam', 'name type category maxMarks');

      let internalTotal = 0;
      let externalTotal = 0;

      marks.forEach(mark => {
        if (mark.exam.category === 'Internal') {
          internalTotal += mark.marksObtained;
        } else {
          externalTotal += mark.marksObtained;
        }
      });

      return {
        course: enrollment.course,
        semester: enrollment.semester,
        internalMarks: internalTotal,
        externalMarks: externalTotal,
        totalMarks: internalTotal + externalTotal,
        grade: enrollment.grade,
        gradePoints: enrollment.gradePoints,
        status: enrollment.status
      };
    })
  );

  // Calculate CGPA
  let totalCredits = 0;
  let totalGradePoints = 0;

  summary.forEach(item => {
    if (item.gradePoints && item.course.credits) {
      totalCredits += item.course.credits;
      totalGradePoints += item.gradePoints * item.course.credits;
    }
  });

  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    cgpa: parseFloat(cgpa),
    totalCreditsEarned: totalCredits,
    data: summary
  });
});

module.exports = {
  getMarks,
  getExamMarks,
  enterMark,
  enterBulkMarks,
  updateMark,
  deleteMark,
  getStudentGradesSummary
};
