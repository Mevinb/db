import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/app/services/api';
import { BookOpen, Users, FileText, Search } from 'lucide-react';

interface CourseStats {
  course: {
    id: string;
    name: string;
    code: string;
  };
  enrolledStudents: number;
  exams: number;
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getFacultyDashboard();
        if (response.success && response.data?.courses) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Courses</h1>
          <p className="text-slate-600 mt-1">Courses assigned to you this semester</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {searchQuery ? 'No Courses Found' : 'No Courses Assigned'}
          </h3>
          <p className="text-slate-500">
            {searchQuery
              ? 'Try adjusting your search terms'
              : "You don't have any courses assigned yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((item) => (
            <div
              key={item.course.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/faculty/attendance?course=${item.course.id}`)}
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
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={16} />
                    <span className="text-sm">Students Enrolled</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.enrolledStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText size={16} />
                    <span className="text-sm">Total Exams</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.exams}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/faculty/attendance?course=${item.course.id}`);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/faculty/grades?course=${item.course.id}`);
                  }}
                  className="flex-1 px-3 py-2 border border-indigo-600 text-indigo-600 text-sm rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Enter Grades
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Table */}
      {!loading && filteredCourses.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Course Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Code</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Students</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Exams</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((item) => (
                  <tr key={item.course.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.course.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.course.code}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {item.enrolledStudents}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {item.exams}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/faculty/attendance?course=${item.course.id}`)}
                          className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/grades?course=${item.course.id}`)}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          Grades
                        </button>
                      </div>
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

export default MyCourses;
