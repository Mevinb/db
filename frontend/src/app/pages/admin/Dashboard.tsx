import React, { useEffect, useState } from 'react';
import { Building2, Users, GraduationCap, BookOpen } from 'lucide-react';
import { dashboardApi, departmentsApi, studentsApi, facultyApi, coursesApi } from '@/app/services/api';

interface DashboardStats {
  totalDepartments: number;
  activeStudents: number;
  facultyMembers: number;
  totalCourses: number;
}

const StatCard = ({ title, value, icon: Icon, color, loading }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
      ) : (
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDepartments: 0,
    activeStudents: 0,
    facultyMembers: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Try to get dashboard data from dedicated endpoint first
        const dashboardRes = await dashboardApi.getAdminDashboard();
        
        if (dashboardRes.success && dashboardRes.data?.overview) {
          // Use the correct nested structure from the API
          const overview = dashboardRes.data.overview;
          setStats({
            totalDepartments: overview.departments || 0,
            activeStudents: overview.students || 0,
            facultyMembers: overview.faculty || 0,
            totalCourses: overview.courses || 0,
          });
        } else {
          // Fallback: fetch counts from individual endpoints
          const [deptsRes, studentsRes, facultyRes, coursesRes] = await Promise.all([
            departmentsApi.getAll(),
            studentsApi.getAll(),
            facultyApi.getAll(),
            coursesApi.getAll(),
          ]);

          setStats({
            totalDepartments: deptsRes.data?.length || 0,
            activeStudents: studentsRes.data?.length || 0,
            facultyMembers: facultyRes.data?.length || 0,
            totalCourses: coursesRes.data?.length || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Departments" 
          value={stats.totalDepartments} 
          icon={Building2} 
          color="bg-indigo-500" 
          loading={loading}
        />
        <StatCard 
          title="Active Students" 
          value={stats.activeStudents.toLocaleString()} 
          icon={Users} 
          color="bg-indigo-500" 
          loading={loading}
        />
        <StatCard 
          title="Faculty Members" 
          value={stats.facultyMembers} 
          icon={GraduationCap} 
          color="bg-indigo-500" 
          loading={loading}
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={BookOpen} 
          color="bg-indigo-500" 
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">System initialized</p>
                  <p className="text-xs text-slate-500">Connected to backend</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Departments</span>
              <span className="font-semibold text-slate-800">{stats.totalDepartments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Students</span>
              <span className="font-semibold text-slate-800">{stats.activeStudents}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Faculty</span>
              <span className="font-semibold text-slate-800">{stats.facultyMembers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Courses</span>
              <span className="font-semibold text-slate-800">{stats.totalCourses}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
