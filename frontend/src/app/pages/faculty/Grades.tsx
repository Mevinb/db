import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardApi, examsApi, marksApi, enrollmentsApi } from '@/app/services/api';
import { GraduationCap, Save, Search, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

interface Exam {
  _id: string;
  name: string;
  maxMarks: number;
  totalMarks?: number; // alias for maxMarks
  type: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface MarkEntry {
  studentId: string;
  marks: string;
}

const Grades: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course');
  
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(preselectedCourse || '');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getFacultyDashboard();
        if (response.success && response.data?.courses) {
          const courseList = response.data.courses.map((c: any) => ({
            id: c.course.id,
            name: c.course.name,
            code: c.course.code,
          }));
          setCourses(courseList);
          
          if (preselectedCourse) {
            setSelectedCourse(preselectedCourse);
          } else if (courseList.length > 0) {
            setSelectedCourse(courseList[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('Failed to load courses');
      }
      setLoading(false);
    };

    fetchCourses();
  }, [preselectedCourse]);

  // Fetch exams when course changes
  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedCourse) {
        setExams([]);
        return;
      }

      try {
        const response = await examsApi.getByCourse(selectedCourse);
        if (response.success && response.data) {
          setExams(response.data);
          if (response.data.length > 0) {
            setSelectedExam(response.data[0]._id);
          } else {
            setSelectedExam('');
          }
        }
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setExams([]);
      }
    };

    fetchExams();
  }, [selectedCourse]);

  // Fetch students and marks when exam changes
  useEffect(() => {
    const fetchStudentsAndMarks = async () => {
      if (!selectedCourse || !selectedExam) {
        setStudents([]);
        setMarks(new Map());
        return;
      }

      setLoadingStudents(true);
      try {
        // Get enrolled students
        const enrollmentRes = await enrollmentsApi.getAll({ course: selectedCourse, status: 'Enrolled' });
        
        if (enrollmentRes.success && enrollmentRes.data) {
          const studentList: Student[] = enrollmentRes.data.map((enrollment: any) => ({
            _id: enrollment.student._id,
            name: enrollment.student.name,
            rollNumber: enrollment.student.rollNumber,
          }));
          setStudents(studentList);

          // Initialize marks
          const initialMarks = new Map<string, string>();
          studentList.forEach((student) => {
            initialMarks.set(student._id, '');
          });

          // Get existing marks
          try {
            const marksRes = await marksApi.getExamMarks(selectedExam);
            if (marksRes.success && marksRes.data) {
              marksRes.data.forEach((mark: any) => {
                if (mark.student) {
                  const studentId = mark.student._id || mark.student;
                  initialMarks.set(studentId, String(mark.marksObtained || ''));
                }
              });
            }
          } catch (e) {
            // No existing marks
          }

          setMarks(initialMarks);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        setStudents([]);
      }
      setLoadingStudents(false);
    };

    fetchStudentsAndMarks();
  }, [selectedCourse, selectedExam]);

  const handleMarkChange = (studentId: string, value: string) => {
    const exam = exams.find((e) => e._id === selectedExam);
    const maxMarks = exam?.maxMarks || exam?.totalMarks || 100;
    
    // Allow empty or valid numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= maxMarks)) {
      setMarks((prev) => {
        const updated = new Map(prev);
        updated.set(studentId, value);
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }

    // Filter out empty marks
    const marksToSubmit = Array.from(marks.entries())
      .filter(([_, value]) => value !== '')
      .map(([studentId, value]) => ({
        student: studentId,
        exam: selectedExam,
        course: selectedCourse,
        marksObtained: Number(value),
      }));

    if (marksToSubmit.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    setSubmitting(true);
    try {
      const response = await marksApi.enterBulk(marksToSubmit);
      if (response.success) {
        toast.success('Marks saved successfully!');
      } else {
        toast.error(response.error || 'Failed to save marks');
      }
    } catch (error) {
      toast.error('Failed to save marks');
    }
    setSubmitting(false);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedExamDetails = exams.find((e) => e._id === selectedExam);
  const selectedCourseName = courses.find((c) => c.id === selectedCourse);

  // Calculate stats
  const enteredMarks = Array.from(marks.values()).filter((m) => m !== '');
  const avgMarks = enteredMarks.length > 0
    ? (enteredMarks.reduce((sum, m) => sum + Number(m), 0) / enteredMarks.length).toFixed(1)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Enter Grades</h1>
        <p className="text-slate-600 mt-1">Record student marks for exams</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedExam('');
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedCourse || exams.length === 0}
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name} ({exam.type}) - Max: {exam.maxMarks || exam.totalMarks}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {selectedExam && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Marks Entered</p>
            <p className="text-2xl font-bold text-indigo-600">{enteredMarks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Max Marks</p>
            <p className="text-2xl font-bold text-slate-800">{selectedExamDetails?.maxMarks || selectedExamDetails?.totalMarks || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Average Marks</p>
            <p className="text-2xl font-bold text-green-600">{avgMarks}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedCourseName && selectedExamDetails
                ? `${selectedExamDetails.name} - ${selectedCourseName.code}`
                : 'Select a Course and Exam'}
            </h2>
          </div>
          {selectedExamDetails && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
              Max Marks: {selectedExamDetails.maxMarks || selectedExamDetails.totalMarks}
            </span>
          )}
        </div>

        {loading || loadingStudents ? (
          <div className="p-8">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : !selectedCourse ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Select a course to view exams</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No exams found for this course</p>
            <p className="text-sm text-slate-400">Exams need to be created by admin first</p>
          </div>
        ) : !selectedExam ? (
          <div className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Select an exam to enter marks</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchQuery ? 'No students match your search' : 'No students enrolled in this course'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Roll Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Student Name</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Marks (out of {selectedExamDetails?.maxMarks || selectedExamDetails?.totalMarks || 100})
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const studentMarks = marks.get(student._id) || '';
                    const maxMarksValue = selectedExamDetails?.maxMarks || selectedExamDetails?.totalMarks || 100;
                    const hasMarks = studentMarks !== '' && !isNaN(Number(studentMarks));
                    const percentageValue = hasMarks && maxMarksValue > 0
                      ? (Number(studentMarks) / maxMarksValue) * 100
                      : null;
                    const percentageDisplay = percentageValue !== null ? percentageValue.toFixed(1) : '-';
                    
                    return (
                      <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{student.rollNumber}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{student.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              max={selectedExamDetails?.maxMarks || selectedExamDetails?.totalMarks || 100}
                              value={studentMarks}
                              onChange={(e) => handleMarkChange(student._id, e.target.value)}
                              placeholder="--"
                              className="w-24 px-3 py-1.5 text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {percentageValue !== null ? (
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-medium ${
                                percentageValue >= 75
                                  ? 'bg-green-100 text-green-700'
                                  : percentageValue >= 50
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : percentageValue >= 35
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {percentageDisplay}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || enteredMarks.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Marks
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Grades;
