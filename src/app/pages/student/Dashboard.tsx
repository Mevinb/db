import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi, announcementsApi } from '@/app/services/api';
import { BookOpen, Calendar, Award, TrendingUp, Clock, ArrowRight, GraduationCap, CheckCircle } from 'lucide-react';
import type { Announcement } from '@/app/types';

interface DashboardCourse {
  id: string;
  name: string;
  code: string;
  progress: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    averageAttendance: 0,
    cgpa: 0,
    creditsCompleted: 0,
  });
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      const [statsRes, announcementsRes] = await Promise.all([
        dashboardApi.getStudentDashboard(),
        announcementsApi.getAll(),
      ]);
      
      if (statsRes.success && statsRes.data) {
        // Map backend response to frontend expected format
        const data = statsRes.data;
        setStats({
          enrolledCourses: data.overview?.enrolledCourses || 0,
          averageAttendance: data.overview?.overallAttendance || 0,
          cgpa: data.overview?.cgpa || data.profile?.cgpa || 0,
          creditsCompleted: data.profile?.creditsCompleted || 0,
        });
        
        // Extract courses from attendance summary (includes course info)
        if (data.attendanceSummary && data.attendanceSummary.length > 0) {
          const coursesFromAPI = data.attendanceSummary.map((item: any, index: number) => ({
            id: item.course?.id || item.course?._id || `course-${index}`,
            name: item.course?.name || 'Unknown Course',
            code: item.course?.code || 'N/A',
            progress: item.percentage || 0, // Using attendance as progress indicator
          }));
          setCourses(coursesFromAPI.slice(0, 4));
        }
        
        // Use announcements from dashboard response if available
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements.slice(0, 3));
        } else if (announcementsRes.success) {
          setAnnouncements(announcementsRes.data.slice(0, 3));
        }
      } else if (announcementsRes.success) {
        setAnnouncements(announcementsRes.data.slice(0, 3));
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-48 bg-purple-200/50 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 overflow-hidden shadow-xl shadow-purple-500/20">
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full opacity-80" />
          <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-400 rounded-full opacity-80" />
          <div className="absolute top-4 left-16 w-3 h-3 bg-green-400 rounded-full opacity-80" />
          <div className="absolute bottom-6 left-1/3 w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-purple-300 rounded-full" />
          
          {/* Content */}
          <div className="relative z-10">
            <p className="text-purple-200 text-sm mb-2">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-purple-200">
              Always stay updated in your student portal
            </p>
          </div>

          {/* Illustration - Right Side */}
          <div className="absolute right-4 bottom-0 w-48 h-48 md:w-64 md:h-64 hidden sm:block">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="60" r="35" fill="#fcd5ce" />
              <circle cx="85" cy="55" r="4" fill="#333" />
              <circle cx="115" cy="55" r="4" fill="#333" />
              <path d="M90 75 Q100 85 110 75" stroke="#333" strokeWidth="2" fill="none" />
              <rect x="75" y="95" width="50" height="60" rx="10" fill="#60a5fa" />
              <rect x="60" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <rect x="120" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <path d="M70 30 L100 10 L130 30 L100 20 Z" fill="#1e40af" />
            </svg>
          </div>
        </div>

        {/* Finance Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Progress</h2>
            <button onClick={() => navigate('/student/grades')} className="text-purple-600 text-sm font-medium hover:underline flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.cgpa}</p>
                <p className="text-gray-500 text-sm mt-1">Current CGPA</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-400 shadow-lg shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.averageAttendance}%</p>
                <p className="text-gray-500 text-sm mt-1">Attendance</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.creditsCompleted}</p>
                <p className="text-gray-500 text-sm mt-1">Credits Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Enrolled Courses</h2>
              <button onClick={() => navigate('/student/courses')} className="text-purple-600 text-sm font-medium hover:underline flex items-center gap-1">
                See all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No courses enrolled yet</p>
                </div>
              ) : (
                courses.map((course) => (
                  <Card key={course.id} className="border-purple-100 overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-end">
                        <div>
                          <p className="text-white/80 text-xs">{course.code}</p>
                          <h3 className="text-white font-semibold">{course.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Attendance</span>
                          <span className="text-gray-800 font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <button onClick={() => navigate(`/student/courses/${course.id}`)} className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                          View Course
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Course Stats</h2>
              <Card className="border-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.enrolledCourses}</p>
                      <p className="text-gray-500 text-sm">Enrolled Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Notice */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daily Notice</h2>
                <button onClick={() => navigate('/student')} className="text-purple-600 text-sm font-medium hover:underline">See all</button>
              </div>
              <Card className="border-purple-100">
                <CardContent className="p-4 space-y-4">
                  {announcements.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No announcements</p>
                  ) : (
                    announcements.map((announcement) => (
                      <div key={announcement._id} className="group">
                        <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {announcement.title}
                        </h4>
                        <p className={`text-sm text-gray-500 mt-1 ${expandedAnnouncement === announcement._id ? '' : 'line-clamp-2'}`}>
                          {announcement.content}
                        </p>
                        <button 
                          onClick={() => setExpandedAnnouncement(expandedAnnouncement === announcement._id ? null : announcement._id)}
                          className="text-purple-600 text-sm font-medium mt-2 hover:underline"
                        >
                          {expandedAnnouncement === announcement._id ? 'See less' : 'See more'}
                        </button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
