import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { Award, BookOpen, TrendingUp, Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CourseGrade {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  examName: string;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
}

interface SemesterGrades {
  semester: string;
  year: string;
  courses: CourseGrade[];
  sgpa: number;
}

const StudentGrades: React.FC = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [semesters, setSemesters] = useState<SemesterGrades[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const response = await dashboardApi.getStudentDashboard();
        
        if (response.success && response.data) {
          const data = response.data;
          
          // Get CGPA from profile
          setCgpa(data.profile?.cgpa || data.overview?.cgpa || 0);
          
          // Process recent marks
          if (data.recentMarks && data.recentMarks.length > 0) {
            const processedGrades: CourseGrade[] = data.recentMarks.map((mark: any) => ({
              id: mark._id || mark.id || '',
              name: mark.course?.name || 'Unknown Course',
              code: mark.course?.code || 'N/A',
              credits: mark.course?.credits || 3,
              instructor: 'Faculty',
              examName: mark.exam?.name || 'Exam',
              examType: mark.exam?.type || 'Test',
              marksObtained: mark.marksObtained || 0,
              maxMarks: mark.exam?.maxMarks || 100,
              percentage: mark.exam?.maxMarks ? Math.round((mark.marksObtained / mark.exam.maxMarks) * 100) : 0,
              grade: calculateGrade(mark.marksObtained, mark.exam?.maxMarks || 100),
            }));
            
            // Get current semester info
            const currentSem = data.currentSemester?.name || 'Current Semester';
            const currentYear = data.currentSemester?.academicYear || new Date().getFullYear().toString();
            
            setSemesters([{
              semester: currentSem,
              year: currentYear,
              courses: processedGrades,
              sgpa: calculateSGPA(processedGrades),
            }]);
            
            setSelectedSemester(currentSem);
          }
        }
      } catch (error) {
        console.error('Failed to fetch grades:', error);
      }
      
      setLoading(false);
    };

    fetchGrades();
  }, [user]);

  const calculateGrade = (obtained: number, max: number): string => {
    const percentage = (obtained / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'B-';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  const calculateSGPA = (courses: CourseGrade[]): number => {
    if (courses.length === 0) return 0;
    const totalPoints = courses.reduce((sum, c) => sum + c.percentage, 0);
    return Math.round((totalPoints / courses.length) / 10) / 10; // Approx SGPA from percentage
  };

  const currentSemester = semesters.find(s => s.semester === selectedSemester);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-700 border-green-200';
      case 'A': return 'bg-green-100 text-green-600 border-green-200';
      case 'B+': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'B': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'B-': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'C': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
            <p className="text-gray-500">View your academic performance</p>
          </div>
          <button onClick={() => toast.success('Transcript download started!')} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            <Download className="w-5 h-5" />
            Download Transcript
          </button>
        </div>

        {/* CGPA Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-purple-200 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 mb-1">Cumulative GPA</p>
                  <p className="text-5xl font-bold">{cgpa}</p>
                  <p className="text-purple-200 mt-2">out of 10.0</p>
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <p className="text-gray-500 mb-1">Current Semester GPA</p>
              <p className="text-4xl font-bold text-purple-600">{currentSemester?.sgpa || '-'}</p>
              <p className="text-gray-500 mt-2">{selectedSemester}</p>
            </CardContent>
          </Card>
        </div>

        {/* Semester Selector */}
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <button
              key={sem.semester}
              onClick={() => setSelectedSemester(sem.semester)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                selectedSemester === sem.semester
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              {sem.semester}
            </button>
          ))}
        </div>

        {/* Grades Table */}
        {currentSemester && currentSemester.courses.length > 0 ? (
          <Card className="border-purple-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Credits</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Exam</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Marks</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Percentage</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {currentSemester.courses.map((course) => (
                      <tr key={course.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{course.name}</p>
                            <p className="text-sm text-gray-500">{course.code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-800">{course.credits}</td>
                        <td className="px-4 py-4 text-center">
                          <div>
                            <p className="text-gray-800">{course.examName}</p>
                            <p className="text-sm text-gray-500">{course.examType}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-gray-800">{course.marksObtained}/{course.maxMarks}</td>
                        <td className="px-4 py-4 text-center font-bold text-gray-800">{course.percentage}%</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(course.grade)}`}>
                            {course.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-purple-100">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-gray-500">No grades available for this semester</p>
            </CardContent>
          </Card>
        )}

        {/* Grade Scale */}
        <Card className="border-purple-100">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Grade Scale</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { grade: 'A+', range: '170-190', points: 10 },
                { grade: 'A', range: '150-169', points: 9 },
                { grade: 'B+', range: '140-149', points: 8 },
                { grade: 'B', range: '120-139', points: 7 },
                { grade: 'B-', range: '100-119', points: 6 },
                { grade: 'C', range: '80-99', points: 5 },
                { grade: 'F', range: '<80', points: 0 },
              ].map((item) => (
                <div key={item.grade} className={`px-4 py-2 rounded-xl border ${getGradeColor(item.grade)}`}>
                  <span className="font-bold">{item.grade}</span>
                  <span className="text-sm ml-2">({item.range})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;
