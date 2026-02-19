import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { BookOpen, Calendar, Award, TrendingUp } from 'lucide-react';

/**
 * Student Dashboard
 * 
 * Features to implement:
 * - View enrolled courses
 * - View attendance percentage
 * - View exam marks and grades
 * - View announcements
 * - View academic calendar
 */

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    averageAttendance: 0,
    cgpa: 0,
    creditsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      const response = await dashboardApi.getStudentDashboard();
      if (response.success && response.data?.overview) {
        const overview = response.data.overview;
        setStats({
          enrolledCourses: overview.enrolledCourses || 0,
          averageAttendance: overview.overallAttendance || 0,
          cgpa: overview.cgpa || 0,
          creditsCompleted: response.data.profile?.semester ? response.data.profile.semester * 20 : 0,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: stats.enrolledCourses,
      icon: <BookOpen className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-500',
    },
    {
      title: 'Attendance',
      value: `${stats.averageAttendance}%`,
      icon: <Calendar className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-500',
    },
    {
      title: 'CGPA',
      value: stats.cgpa,
      icon: <Award className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-500',
    },
    {
      title: 'Credits Completed',
      value: stats.creditsCompleted,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-500 text-center">
            Student features: View enrolled courses, Check attendance, View marks and grades, View announcements
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
