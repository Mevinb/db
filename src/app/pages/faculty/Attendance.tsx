import React, { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { UserCheck, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  status: 'present' | 'absent' | 'late' | null;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

const FacultyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('CS201');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const courses: Course[] = [
    { id: 'CS201', name: 'Data Structures', code: 'CS201' },
    { id: 'CS301', name: 'Operating Systems', code: 'CS301' },
    { id: 'CS302', name: 'Database Systems', code: 'CS302' },
    { id: 'CS303', name: 'Computer Networks', code: 'CS303' },
  ];

  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Rahul Verma', rollNo: 'CS2021001', status: null },
    { id: '2', name: 'Priya Sharma', rollNo: 'CS2021002', status: null },
    { id: '3', name: 'Amit Kumar', rollNo: 'CS2021003', status: null },
    { id: '4', name: 'Sneha Patel', rollNo: 'CS2021004', status: null },
    { id: '5', name: 'Vikram Singh', rollNo: 'CS2021005', status: null },
    { id: '6', name: 'Ananya Gupta', rollNo: 'CS2021006', status: null },
    { id: '7', name: 'Rohit Jain', rollNo: 'CS2021007', status: null },
    { id: '8', name: 'Kavita Reddy', rollNo: 'CS2021008', status: null },
  ]);

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' })));
  };

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    unmarked: students.filter(s => s.status === null).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
            <p className="text-gray-500">Mark and manage student attendance</p>
          </div>
          <button
            onClick={markAllPresent}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Mark All Present
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
              readOnly
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-green-700">Present</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-red-700">Absent</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-sm text-yellow-700">Late</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.unmarked}</p>
              <p className="text-sm text-purple-700">Unmarked</p>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card className="border-purple-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">{student.rollNo}</td>
                      <td className="px-6 py-4 text-gray-800">{student.name}</td>
                      <td className="px-6 py-4">
                        {student.status === 'present' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Present</span>
                        )}
                        {student.status === 'absent' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Absent</span>
                        )}
                        {student.status === 'late' && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Late</span>
                        )}
                        {student.status === null && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">Unmarked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => markAttendance(student.id, 'present')}
                            className={`p-2 rounded-lg transition-all ${student.status === 'present' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'absent')}
                            className={`p-2 rounded-lg transition-all ${student.status === 'absent' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, 'late')}
                            className={`p-2 rounded-lg transition-all ${student.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'}`}
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button onClick={() => toast.success('Attendance submitted successfully!')} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Submit Attendance
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyAttendance;
