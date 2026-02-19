import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CalendarRange, 
  School,
  LogOut,
  ClipboardList,
  Bell,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin navigation items
  const adminNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/programs', icon: School, label: 'Programs' },
    { to: '/admin/faculty', icon: GraduationCap, label: 'Faculty' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/semesters', icon: CalendarRange, label: 'Semesters' },
  ];

  // Faculty navigation items
  const facultyNavItems = [
    { to: '/faculty', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/faculty/exams', icon: FileText, label: 'Exams' },
    { to: '/faculty/attendance', icon: ClipboardList, label: 'Attendance' },
    { to: '/faculty/grades', icon: GraduationCap, label: 'Grades' },
  ];

  // Student navigation items
  const studentNavItems = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/attendance', icon: ClipboardList, label: 'Attendance' },
    { to: '/student/grades', icon: GraduationCap, label: 'Grades' },
    { to: '/student/announcements', icon: Bell, label: 'Announcements' },
  ];

  // Select navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'faculty':
        return facultyNavItems;
      case 'student':
        return studentNavItems;
      default:
        return adminNavItems;
    }
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'CMS Admin';
      case 'faculty':
        return 'Faculty Portal';
      case 'student':
        return 'Student Portal';
      default:
        return 'CMS Portal';
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-indigo-900 text-white flex flex-col shadow-xl z-10 bg-gradient-to-b from-indigo-900 to-purple-900">
      <div className="p-6 border-b border-indigo-700/50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
          {getRoleTitle()}
        </h1>
        <p className="text-xs text-indigo-300 mt-1">
          {user?.name || 'University Management'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10'
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-700/50">
        <div className="mb-3 px-4 py-2 rounded-lg bg-white/5">
          <p className="text-xs text-indigo-300">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
