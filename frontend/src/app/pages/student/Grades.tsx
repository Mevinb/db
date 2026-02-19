import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi, marksApi } from '@/app/services/api';
import { GraduationCap, Award, TrendingUp, BookOpen, Search } from 'lucide-react';

interface MarkEntry {
  _id: string;
  course?: { name: string; code: string };
  exam?: { name: string; type: string };
  marksObtained: number;
  totalMarks?: number;
  grade?: string;
}

interface GradeSummary {
  course: { id: string; name: string; code: string };
  exams: Array<{
    name: string;
    type: string;
    marksObtained: number;
    maxMarks: number;
    percentage: number;
  }>;
  averagePercentage: number;
}

const StudentGrades: React.FC = () => {
  const { user } = useAuth();
  const [recentMarks, setRecentMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [cgpa, setCgpa] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getStudentDashboard();
        if (response.success && response.data) {
          setRecentMarks(response.data.recentMarks || []);
          setCgpa(response.data.overview?.cgpa || 0);
        }
      } catch (error) {
        console.error('Failed to fetch grades:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const filteredMarks = recentMarks.filter(
    (m) =>
      (m.course?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (m.course?.code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (m.exam?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalExams = recentMarks.length;
  const averagePercentage =
    totalExams > 0
      ? Math.round(
          recentMarks.reduce((sum, m) => {
            const max = m.totalMarks || 100;
            return sum + (m.marksObtained / max) * 100;
          }, 0) / totalExams
        )
      : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
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
          <h1 className="text-3xl font-bold text-slate-800">My Grades</h1>
          <p className="text-slate-600 mt-1">View your exam results and grades</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by course or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-lg">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">CGPA</p>
            <p className="text-2xl font-bold text-slate-800">{cgpa || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-lg">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Published Results</p>
            <p className="text-2xl font-bold text-slate-800">{totalExams}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-800">{averagePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      {filteredMarks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {searchQuery ? 'No Results Found' : 'No Grades Available'}
          </h3>
          <p className="text-slate-500">
            {searchQuery ? 'Try adjusting your search' : 'Your exam results will appear here once published.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">Recent Exam Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Exam</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Marks</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Percentage</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((mark, index) => {
                  const maxMarks = mark.totalMarks || 100;
                  const percentage = maxMarks > 0 ? Math.round((mark.marksObtained / maxMarks) * 100) : 0;
                  const grade =
                    mark.grade ||
                    (percentage >= 90
                      ? 'A+'
                      : percentage >= 80
                      ? 'A'
                      : percentage >= 70
                      ? 'B+'
                      : percentage >= 60
                      ? 'B'
                      : percentage >= 50
                      ? 'C'
                      : percentage >= 40
                      ? 'D'
                      : 'F');

                  return (
                    <tr key={mark._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{mark.course?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{mark.course?.code || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{mark.exam?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {mark.exam?.type || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {mark.marksObtained}/{maxMarks}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-semibold ${
                            percentage >= 60 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            grade.startsWith('A')
                              ? 'bg-green-100 text-green-700'
                              : grade === 'B+' || grade === 'B'
                              ? 'bg-blue-100 text-blue-700'
                              : grade === 'C' || grade === 'D'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
