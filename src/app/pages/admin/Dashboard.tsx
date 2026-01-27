import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { dashboardApi, announcementsApi } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { Users, UserCheck, BookMarked, Building2, Megaphone, ArrowRight, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { Announcement } from '@/app/types';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 0,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [statsRes, announcementsRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        announcementsApi.getAll(),
      ]);

      if (statsRes.success && statsRes.data) {
        // Map backend response to frontend expected format
        const data = statsRes.data;
        setStats({
          totalStudents: data.overview?.students || 0,
          totalFaculty: data.overview?.faculty || 0,
          totalCourses: data.overview?.courses || 0,
          totalDepartments: data.overview?.departments || 0,
        });
      }

      if (announcementsRes.success) {
        setAnnouncements(announcementsRes.data.slice(0, 3));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

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
              Always stay updated in your admin portal
            </p>
          </div>

          {/* Illustration - Right Side */}
          <div className="absolute right-4 bottom-0 w-48 h-48 md:w-64 md:h-64 hidden sm:block">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Simplified character illustration */}
              <circle cx="100" cy="60" r="35" fill="#fcd5ce" />
              <circle cx="85" cy="55" r="4" fill="#333" />
              <circle cx="115" cy="55" r="4" fill="#333" />
              <path d="M90 75 Q100 85 110 75" stroke="#333" strokeWidth="2" fill="none" />
              <rect x="75" y="95" width="50" height="60" rx="10" fill="#a855f7" />
              <rect x="60" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <rect x="120" y="100" width="20" height="40" rx="5" fill="#fcd5ce" />
              <rect x="130" y="20" width="30" height="25" rx="3" fill="#fbbf24" />
              <circle cx="145" cy="32" r="8" fill="#333" />
            </svg>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Finance-like Stats */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
                  <p className="text-gray-500 text-sm mt-1">Total Students</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-400 shadow-lg shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalFaculty}</p>
                  <p className="text-gray-500 text-sm mt-1">Total Faculty</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalDepartments}</p>
                  <p className="text-gray-500 text-sm mt-1">Departments</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar Content */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Course Stats</h2>
              <Card className="border-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookMarked className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalCourses}</p>
                      <p className="text-gray-500 text-sm">Active Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Notice */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daily Notice</h2>
                <button onClick={() => navigate('/admin')} className="text-purple-600 text-sm font-medium hover:underline">See all</button>
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

        {/* Quick Actions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Students', icon: Users, path: '/admin/students' },
              { title: 'Faculty', icon: UserCheck, path: '/admin/faculty' },
              { title: 'Courses', icon: BookMarked, path: '/admin/courses' },
              { title: 'Departments', icon: Building2, path: '/admin/departments' },
            ].map((action) => (
              <Card 
                key={action.title} 
                onClick={() => navigate(action.path)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 cursor-pointer hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{action.title}</p>
                    <button className="mt-2 px-4 py-1.5 bg-white rounded-lg text-sm font-medium text-purple-600 shadow-md hover:shadow-lg transition-all">
                      View
                    </button>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
