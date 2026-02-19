import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { BookOpen, Users, Clock, Search } from 'lucide-react';

interface CourseInfo {
  course: {
    id: string;
    name: string;
    code: string;
    faculty?: string;
  };
  totalClasses: number;
  attended: number;
  percentage: number;
}

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getStudentDashboard();
        if (response.success && response.data?.attendanceSummary) {
          setCourses(response.data.attendanceSummary);
          setFilteredCourses(response.data.attendanceSummary);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Courses</h1>
          <p className="text-slate-600 mt-1">Courses you are enrolled in this semester</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {searchQuery ? 'No Courses Found' : 'No Courses Enrolled'}
          </h3>
          <p className="text-slate-500">
            {searchQuery ? 'Try adjusting your search' : 'You are not enrolled in any courses yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((item) => (
            <div
              key={item.course.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{item.course.name}</h3>
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-md mt-1">
                    {item.course.code}
                  </span>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
              </div>

              {item.course.faculty && (
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Users size={16} />
                  <span className="text-sm">Faculty: {item.course.faculty}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} />
                    <span className="text-sm">Classes Attended</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {item.attended}/{item.totalClasses}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Attendance</span>
                    <span className={`font-semibold ${item.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Table */}
      {filteredCourses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Course Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Faculty</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Classes</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((item) => (
                  <tr key={item.course.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.course.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.course.code}</td>
                    <td className="py-3 px-4 text-slate-600">{item.course.faculty || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {item.attended}/{item.totalClasses}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
