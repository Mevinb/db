import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi, attendanceApi } from '@/app/services/api';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  day: string;
  status: 'present' | 'absent' | 'late' | 'holiday';
}

interface CourseAttendance {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  records: AttendanceRecord[];
}

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courses, setCourses] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const response = await dashboardApi.getStudentDashboard();
        
        if (response.success && response.data) {
          const data = response.data;
          
          if (data.attendanceSummary && data.attendanceSummary.length > 0) {
            const coursesFromAPI: CourseAttendance[] = data.attendanceSummary.map((item: any) => ({
              id: item.course?.id || item.course?._id || '',
              name: item.course?.name || 'Unknown Course',
              code: item.course?.code || 'N/A',
              totalClasses: item.totalClasses || 0,
              attended: item.attended || 0,
              percentage: item.percentage || 0,
              records: [], // Detailed records would need another API call
            }));
            
            setCourses(coursesFromAPI);
            if (coursesFromAPI.length > 0) {
              setSelectedCourse(coursesFromAPI[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      }
      
      setLoading(false);
    };

    fetchAttendance();
  }, [user]);

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const overallAttendance = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + c.percentage, 0) / courses.length)
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'holiday': return <Calendar className="w-5 h-5 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-yellow-100 text-yellow-700';
      case 'holiday': return 'bg-gray-100 text-gray-500';
      default: return '';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            <p className="text-gray-500">Track your attendance across all courses</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-600">{overallAttendance}% Overall</span>
          </div>
        </div>

        {/* Course Attendance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <Card 
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                selectedCourse === course.id 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'border-purple-100 hover:border-purple-300'
              }`}
            >
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">{course.code}</p>
                <h3 className="font-semibold text-gray-800 mb-3">{course.name}</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${getPercentageColor(course.percentage)}`}>
                      {course.percentage}%
                    </p>
                    <p className="text-xs text-gray-500">{course.attended}/{course.totalClasses} classes</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance Details */}
        {currentCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <Card className="border-purple-100">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">{currentCourse.name} Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Present</span>
                    </div>
                    <span className="font-bold text-green-600">{currentCourse.attended}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700">Absent</span>
                    </div>
                    <span className="font-bold text-red-600">{currentCourse.totalClasses - currentCourse.attended}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700">Total Classes</span>
                    </div>
                    <span className="font-bold text-purple-600">{currentCourse.totalClasses}</span>
                  </div>
                </div>

                {/* Attendance Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className={`font-bold ${getPercentageColor(currentCourse.percentage)}`}>
                      {currentCourse.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentCourse.percentage >= 85 ? 'bg-green-500' :
                        currentCourse.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${currentCourse.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {currentCourse.percentage >= 75 
                      ? '✓ Meeting minimum attendance requirement (75%)' 
                      : '⚠ Below minimum attendance requirement (75%)'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="lg:col-span-2 border-purple-100">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Attendance Records</h3>
                {currentCourse.records.length > 0 ? (
                  <div className="space-y-3">
                    {currentCourse.records.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-medium text-gray-800">{record.day}</p>
                            <p className="text-sm text-gray-500">{record.date}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                    <p>No recent records available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
