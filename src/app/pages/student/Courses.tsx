import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { BookOpen, Clock, User, ArrowRight, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  schedule: string;
  progress: number;
  nextClass: string;
}

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      setLoading(true);
      const response = await dashboardApi.getStudentDashboard();
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Map attendance summary to courses with proper data structure
        if (data.attendanceSummary && data.attendanceSummary.length > 0) {
          const coursesFromAPI = data.attendanceSummary.map((item: any) => ({
            id: item.course?.id || item.course?._id || '',
            name: item.course?.name || 'Unknown Course',
            code: item.course?.code || 'N/A',
            instructor: item.course?.faculty || 'Not Assigned',
            credits: item.course?.credits || 3,
            schedule: 'Schedule TBD',
            progress: item.percentage || 0,
            nextClass: 'Check timetable',
          }));
          setCourses(coursesFromAPI);
        }
      }
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);

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
            <p className="text-gray-500">View and manage your enrolled courses</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-600">{courses.length} Courses</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
              <span className="font-semibold text-purple-600">{totalCredits} Credits</span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              onClick={() => navigate(`/student/courses/${course.id}`)}
              className="border-purple-100 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <CardContent className="p-0">
                <div className="h-28 bg-gradient-to-r from-purple-500 to-purple-600 p-5 flex items-end justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{course.code}</p>
                    <h3 className="text-xl font-bold text-white">{course.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{course.credits} Credits</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-purple-500" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{course.schedule}</span>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Course Progress</span>
                      <span className="text-sm font-medium text-purple-600">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-purple-600 font-medium">Next: {course.nextClass}</span>
                    <div className="flex items-center gap-1 text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
