import React, { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { BookOpen, Save, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  assignment1: number;
  assignment2: number;
  midterm: number;
  final: number;
  total: number;
  grade: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

const FacultyGrades: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('CS201');
  
  const courses: Course[] = [
    { id: 'CS201', name: 'Data Structures', code: 'CS201' },
    { id: 'CS301', name: 'Operating Systems', code: 'CS301' },
    { id: 'CS302', name: 'Database Systems', code: 'CS302' },
    { id: 'CS303', name: 'Computer Networks', code: 'CS303' },
  ];

  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Rahul Verma', rollNo: 'CS2021001', assignment1: 18, assignment2: 17, midterm: 42, final: 78, total: 155, grade: 'A' },
    { id: '2', name: 'Priya Sharma', rollNo: 'CS2021002', assignment1: 20, assignment2: 19, midterm: 45, final: 82, total: 166, grade: 'A+' },
    { id: '3', name: 'Amit Kumar', rollNo: 'CS2021003', assignment1: 15, assignment2: 16, midterm: 38, final: 65, total: 134, grade: 'B+' },
    { id: '4', name: 'Sneha Patel', rollNo: 'CS2021004', assignment1: 19, assignment2: 18, midterm: 40, final: 75, total: 152, grade: 'A' },
    { id: '5', name: 'Vikram Singh', rollNo: 'CS2021005', assignment1: 14, assignment2: 15, midterm: 35, final: 60, total: 124, grade: 'B' },
    { id: '6', name: 'Ananya Gupta', rollNo: 'CS2021006', assignment1: 17, assignment2: 18, midterm: 43, final: 80, total: 158, grade: 'A' },
    { id: '7', name: 'Rohit Jain', rollNo: 'CS2021007', assignment1: 12, assignment2: 13, midterm: 30, final: 55, total: 110, grade: 'B-' },
    { id: '8', name: 'Kavita Reddy', rollNo: 'CS2021008', assignment1: 20, assignment2: 20, midterm: 48, final: 88, total: 176, grade: 'A+' },
  ]);

  const calculateGrade = (total: number): string => {
    if (total >= 170) return 'A+';
    if (total >= 150) return 'A';
    if (total >= 140) return 'B+';
    if (total >= 120) return 'B';
    if (total >= 100) return 'B-';
    if (total >= 80) return 'C';
    return 'F';
  };

  const updateGrade = (studentId: string, field: keyof Student, value: number) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, [field]: value };
        updated.total = updated.assignment1 + updated.assignment2 + updated.midterm + updated.final;
        updated.grade = calculateGrade(updated.total);
        return updated;
      }
      return s;
    }));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-700';
      case 'A': return 'bg-green-100 text-green-600';
      case 'B+': return 'bg-blue-100 text-blue-700';
      case 'B': return 'bg-blue-100 text-blue-600';
      case 'B-': return 'bg-yellow-100 text-yellow-700';
      case 'C': return 'bg-orange-100 text-orange-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
            <p className="text-gray-500">Manage student grades and assessments</p>
          </div>
          <button onClick={() => toast.success('Grades saved successfully!')} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            <Save className="w-5 h-5" />
            Save Grades
          </button>
        </div>

        {/* Course Selection */}
        <div className="max-w-md">
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

        {/* Grade Breakdown Info */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div><span className="font-medium text-purple-700">Assignment 1:</span> 20 marks</div>
              <div><span className="font-medium text-purple-700">Assignment 2:</span> 20 marks</div>
              <div><span className="font-medium text-purple-700">Midterm:</span> 50 marks</div>
              <div><span className="font-medium text-purple-700">Final:</span> 100 marks</div>
              <div><span className="font-medium text-purple-700">Total:</span> 190 marks</div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card className="border-purple-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Assign 1 (20)</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Assign 2 (20)</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Midterm (50)</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Final (100)</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-4 py-4 text-gray-800 font-medium">{student.rollNo}</td>
                      <td className="px-4 py-4 text-gray-800">{student.name}</td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={student.assignment1}
                          onChange={(e) => updateGrade(student.id, 'assignment1', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={student.assignment2}
                          onChange={(e) => updateGrade(student.id, 'assignment2', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={student.midterm}
                          onChange={(e) => updateGrade(student.id, 'midterm', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={student.final}
                          onChange={(e) => updateGrade(student.id, 'final', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-gray-800">{student.total}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(student.grade)}`}>
                          {student.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyGrades;
