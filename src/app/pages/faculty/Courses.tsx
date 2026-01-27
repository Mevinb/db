import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { BookOpen, Users, Clock, Calendar, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  students: number;
  schedule: string;
  room: string;
}

const FacultyCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const response = await dashboardApi.getFacultyDashboard();
        
        if (response.success && response.data) {
          const data = response.data;
          
          if (data.courses && data.courses.length > 0) {
            const coursesFromAPI = data.courses.map((c: any) => ({
              id: c.course?.id || '',
              name: c.course?.name || 'Unknown Course',
              code: c.course?.code || 'N/A',
              students: c.enrolledStudents || 0,
              schedule: 'Check timetable',
              room: 'Check department',
            }));
            setCourses(coursesFromAPI);
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
      
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

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
            <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
            <p className="text-gray-500">Manage your assigned courses</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-600">{courses.length} Courses</span>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No courses assigned yet</p>
              <p className="text-gray-400 text-sm mt-2">Contact your department for course assignments</p>
            </div>
          ) : (
            courses.map((course) => (
            <Card key={course.id} className="border-purple-100 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-end justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{course.code}</p>
                    <h3 className="text-xl font-bold text-white">{course.name}</h3>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.students} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.schedule}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{course.room}</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => navigate('/faculty/attendance')} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                      Take Attendance
                    </button>
                    <button onClick={() => navigate('/faculty/grades')} className="flex-1 py-2.5 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-all">
                      View Students
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyCourses;
