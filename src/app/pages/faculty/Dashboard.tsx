import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi, announcementsApi } from '@/app/services/api';
import { BookOpen, Users, ClipboardList, Calendar, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Announcement } from '@/app/types';

interface CourseData {
  id: string;
  name: string;
  code: string;
  students: number;
}

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assignedCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    upcomingClasses: 0,
  });
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [pendingAttendance, setPendingAttendance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      const [statsRes, announcementsRes] = await Promise.all([
        dashboardApi.getFacultyDashboard(),
        announcementsApi.getAll(),
      ]);
      
      if (statsRes.success && statsRes.data) {
        // Map backend response to frontend expected format
        const data = statsRes.data;
        setStats({
          assignedCourses: data.overview?.totalCourses || 0,
          totalStudents: data.overview?.totalStudents || 0,
          pendingGrades: data.pendingAttendance?.length || 0,
          upcomingClasses: data.courses?.length || 0,
        });
        
        // Map courses from the dashboard response
        if (data.courses && data.courses.length > 0) {
          const coursesData = data.courses.map((c: any) => ({
            id: c.course?.id || '',
            name: c.course?.name || 'Unknown Course',
            code: c.course?.code || 'N/A',
            students: c.enrolledStudents || 0,
          }));
          setCourses(coursesData.slice(0, 4));
        }
        
        // Set pending attendance
        if (data.pendingAttendance) {
          setPendingAttendance(data.pendingAttendance);
        }
        
        // Use announcements from dashboard if available
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
              Always stay updated in your faculty portal
            </p>
          </div>

          {/* Illustration - Right Side */}
          <div className="absolute right-4 bottom-0 w-48 h-48 md:w-64 md:h-64 hidden sm:block">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="60" r="35" fill="#fcd5ce" />
              <circle cx="85" cy="55" r="4" fill="#333" />
              <circle cx="115" cy="55" r="4" fill="#333" />
              <path d="M90 75 Q100 85 110 75" stroke="#333" strokeWidth="2" fill="none" />
              <rect x="75" y="95" width="50" height="60" rx="10" fill="#10b981" />
              <rect x="60" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <rect x="120" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <rect x="130" y="20" width="30" height="40" rx="3" fill="#f3f4f6" />
              <line x1="135" y1="28" x2="155" y2="28" stroke="#9ca3af" strokeWidth="2" />
              <line x1="135" y1="35" x2="150" y2="35" stroke="#9ca3af" strokeWidth="2" />
              <line x1="135" y1="42" x2="155" y2="42" stroke="#9ca3af" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Overview</h2>
            <button onClick={() => navigate('/faculty/courses')} className="text-purple-600 text-sm font-medium hover:underline flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.assignedCourses}</p>
                <p className="text-gray-500 text-sm mt-1">Assigned Courses</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-400 shadow-lg shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
                <p className="text-gray-500 text-sm mt-1">Total Students</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-7 h-7 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingGrades}</p>
                <p className="text-gray-500 text-sm mt-1">Pending Grades</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.upcomingClasses}</p>
                <p className="text-gray-500 text-sm mt-1">Upcoming Classes</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
              <button onClick={() => navigate('/faculty/courses')} className="text-purple-600 text-sm font-medium hover:underline flex items-center gap-1">
                See all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No courses assigned yet</p>
                </div>
              ) : (
                courses.map((course, index) => (
                  <Card key={course.id || index} className="border-purple-100 overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-end">
                        <div>
                          <p className="text-white/80 text-xs">{course.code}</p>
                          <h3 className="text-white font-semibold">{course.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                          <Users className="w-4 h-4" />
                          <span>{course.students} Students</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate('/faculty/attendance')} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                            Attendance
                          </button>
                          <button onClick={() => navigate('/faculty/grades')} className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all">
                            Grades
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Pending Attendance</h2>
              </div>
              <Card className="border-purple-100">
                <CardContent className="p-4 space-y-3">
                  {pendingAttendance.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-700">All caught up!</p>
                        <p className="text-sm text-gray-500">No pending attendance for today</p>
                      </div>
                    </div>
                  ) : (
                    pendingAttendance.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.name || 'Course'}</p>
                          <p className="text-sm text-gray-500">{item.code || 'Attendance pending'}</p>
                        </div>
                        <button 
                          onClick={() => navigate('/faculty/attendance')}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          Mark
                        </button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Daily Notice */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daily Notice</h2>
                <button onClick={() => navigate('/faculty')} className="text-purple-600 text-sm font-medium hover:underline">See all</button>
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

export default FacultyDashboard;
