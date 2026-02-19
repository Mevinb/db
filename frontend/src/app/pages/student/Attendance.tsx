import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi } from '@/app/services/api';
import { ClipboardList, Check, X, Clock, Search, TrendingUp } from 'lucide-react';

interface AttendanceInfo {
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

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceInfo[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getStudentDashboard();
        if (response.success && response.data) {
          const summary = response.data.attendanceSummary || [];
          setAttendance(summary);
          setFilteredAttendance(summary);
          setOverallPercentage(response.data.overview?.overallAttendance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, [user]);

  useEffect(() => {
    const filtered = attendance.filter(
      (a) =>
        a.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAttendance(filtered);
  }, [searchQuery, attendance]);

  const totalClasses = attendance.reduce((sum, a) => sum + a.totalClasses, 0);
  const totalAttended = attendance.reduce((sum, a) => sum + a.attended, 0);
  const totalAbsent = totalClasses - totalAttended;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-slate-600 mt-1">Track your attendance across all courses</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Classes</p>
            <p className="text-xl font-bold text-slate-800">{totalClasses}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Check size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Present</p>
            <p className="text-xl font-bold text-green-600">{totalAttended}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <X size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Absent</p>
            <p className="text-xl font-bold text-red-600">{totalAbsent}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${overallPercentage >= 75 ? 'bg-green-100' : 'bg-red-100'}`}>
            <TrendingUp size={20} className={overallPercentage >= 75 ? 'text-green-600' : 'text-red-600'} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Overall</p>
            <p className={`text-xl font-bold ${overallPercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {overallPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Attendance by Course */}
      {filteredAttendance.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Attendance Data</h3>
          <p className="text-slate-500">No attendance records found for your courses.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Course-wise Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Code</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Present</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Absent</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Attendance %</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((item) => (
                  <tr key={item.course.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.course.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.course.code}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{item.totalClasses}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {item.attended}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {item.totalClasses - item.attended}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.percentage >= 75
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.percentage >= 75 ? 'Good' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning */}
      {attendance.some((a) => a.percentage < 75) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Attendance Warning</h4>
              <p className="text-sm text-red-600 mt-1">
                Your attendance is below 75% in some courses. Please ensure regular attendance to avoid any academic penalties.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
