import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardApi, attendanceApi, enrollmentsApi } from '@/app/services/api';
import { ClipboardList, Check, X, Clock, Calendar, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

const Attendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course');
  
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(preselectedCourse || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [existingAttendance, setExistingAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
          
          // Auto-select first course or preselected
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

  // Fetch students when course or date changes
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedCourse) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        // Get enrolled students for this course
        const enrollmentRes = await enrollmentsApi.getAll({ course: selectedCourse, status: 'Enrolled' });
        
        if (enrollmentRes.success && enrollmentRes.data) {
          const studentList: Student[] = enrollmentRes.data.map((enrollment: any) => ({
            _id: enrollment.student._id,
            name: enrollment.student.name,
            rollNumber: enrollment.student.rollNumber,
          }));
          setStudents(studentList);

          // Initialize attendance - default to Present
          const initialAttendance = new Map<string, AttendanceStatus>();
          studentList.forEach((student) => {
            initialAttendance.set(student._id, 'Present');
          });
          setAttendance(initialAttendance);

          // Try to get existing attendance for this date
          try {
            const attendanceRes = await attendanceApi.getCourseAttendance(selectedCourse, selectedDate);
            if (attendanceRes.success && attendanceRes.data && attendanceRes.data.length > 0) {
              const existing = new Map<string, AttendanceStatus>();
              attendanceRes.data.forEach((record: any) => {
                if (record.student) {
                  const status = record.status as AttendanceStatus;
                  existing.set(record.student._id || record.student, status);
                  initialAttendance.set(record.student._id || record.student, status);
                }
              });
              setExistingAttendance(existing);
              setAttendance(new Map(initialAttendance));
            } else {
              setExistingAttendance(new Map());
            }
          } catch (e) {
            // No existing attendance, that's fine
            setExistingAttendance(new Map());
          }
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load students');
        setStudents([]);
      }
      setLoadingStudents(false);
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, selectedDate]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const updated = new Map(prev);
      updated.set(studentId, status);
      return updated;
    });
  };

  const markAllAs = (status: AttendanceStatus) => {
    const updated = new Map<string, AttendanceStatus>();
    students.forEach((student) => {
      updated.set(student._id, status);
    });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (students.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    setSubmitting(true);
    try {
      const records = Array.from(attendance.entries()).map(([studentId, status]) => ({
        student: studentId,
        course: selectedCourse,
        date: selectedDate,
        status,
      }));

      const response = await attendanceApi.markBulk(records);

      if (response.success) {
        toast.success('Attendance marked successfully!');
        setExistingAttendance(new Map(attendance));
      } else {
        toast.error(response.error || 'Failed to mark attendance');
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
    setSubmitting(false);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    present: Array.from(attendance.values()).filter((s) => s === 'Present').length,
    absent: Array.from(attendance.values()).filter((s) => s === 'Absent').length,
    late: Array.from(attendance.values()).filter((s) => s === 'Late').length,
  };

  const selectedCourseName = courses.find((c) => c.id === selectedCourse);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Mark Attendance</h1>
        <p className="text-slate-600 mt-1">Record student attendance for your courses</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
      {selectedCourse && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-800">{students.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Present</p>
              <p className="text-xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Absent</p>
              <p className="text-xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Late</p>
              <p className="text-xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedCourseName ? `${selectedCourseName.name} - ${selectedCourseName.code}` : 'Select a Course'}
            </h2>
            {existingAttendance.size > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Attendance recorded
              </span>
            )}
          </div>
          {students.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAllAs('Present')}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAllAs('Absent')}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
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
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Select a course to mark attendance</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
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
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{student.rollNumber}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{student.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setStudentStatus(student._id, 'Present')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                              attendance.get(student._id) === 'Present'
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            <Check size={14} />
                            Present
                          </button>
                          <button
                            onClick={() => setStudentStatus(student._id, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                              attendance.get(student._id) === 'Absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            <X size={14} />
                            Absent
                          </button>
                          <button
                            onClick={() => setStudentStatus(student._id, 'Late')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                              attendance.get(student._id) === 'Late'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-700'
                            }`}
                          >
                            <Clock size={14} />
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Attendance
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

export default Attendance;
