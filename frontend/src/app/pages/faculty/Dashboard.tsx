import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, TrendingUp } from 'lucide-react';
import { dashboardApi } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';

interface CourseStats {
  course: {
    id: string;
    name: string;
    code: string;
  };
  enrolledStudents: number;
  exams: number;
}

interface DashboardData {
  overview: {
    totalCourses: number;
    totalStudents: number;
  };
  courses: CourseStats[];
  pendingAttendance: Array<{ id: string; name: string; code: string }>;
  currentSemester: { name: string; code: string } | null;
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

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    overview: { totalCourses: 0, totalStudents: 0 },
    courses: [],
    pendingAttendance: [],
    currentSemester: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getFacultyDashboard();
        if (response.success && response.data) {
          setData({
            overview: response.data.overview || { totalCourses: 0, totalStudents: 0 },
            courses: response.data.courses || [],
            pendingAttendance: response.data.pendingAttendance || [],
            currentSemester: response.data.currentSemester || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Faculty Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
        {data.currentSemester && (
          <p className="text-sm text-indigo-600 mt-1">
            Current Semester: {data.currentSemester.name} ({data.currentSemester.code})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Assigned Courses"
          value={data.overview.totalCourses}
          icon={BookOpen}
          color="bg-indigo-500"
          loading={loading}
        />
        <StatCard
          title="Total Students"
          value={data.overview.totalStudents}
          icon={Users}
          color="bg-indigo-500"
          loading={loading}
        />
        <StatCard
          title="Pending Attendance"
          value={data.pendingAttendance.length}
          icon={ClipboardList}
          color="bg-indigo-500"
          loading={loading}
        />
        <StatCard
          title="Active Courses"
          value={data.courses.length}
          icon={Calendar}
          color="bg-indigo-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assigned Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-500" />
            My Courses
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : data.courses.length > 0 ? (
            <div className="space-y-3">
              {data.courses.map((item) => (
                <div
                  key={item.course.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{item.course.name}</p>
                    <p className="text-sm text-slate-500">{item.course.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-indigo-600">
                      {item.enrolledStudents} students
                    </p>
                    <p className="text-xs text-slate-500">{item.exams} exams</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No courses assigned</p>
          )}
        </div>

        {/* Pending Attendance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-orange-500" />
            Pending Attendance (Today)
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : data.pendingAttendance.length > 0 ? (
            <div className="space-y-3">
              {data.pendingAttendance.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div>
                    <p className="font-medium text-slate-800">{course.name}</p>
                    <p className="text-sm text-slate-500">{course.code}</p>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Not marked
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp size={40} className="mx-auto text-green-500 mb-2" />
              <p className="text-green-600 font-medium">All attendance marked!</p>
              <p className="text-slate-500 text-sm">Great job staying on top of things</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Course Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Code</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Students</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Exams</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : data.courses.length > 0 ? (
                data.courses.map((item) => (
                  <tr key={item.course.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.course.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.course.code}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                        {item.enrolledStudents}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {item.exams}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No courses to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
