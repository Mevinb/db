import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  UserCheck,
  BookMarked,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: 'admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Departments',
    path: 'admin/departments',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Programs',
    path: 'admin/programs',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Students',
    path: 'admin/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Faculty',
    path: 'admin/faculty',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Courses',
    path: 'admin/courses',
    icon: <BookMarked className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Semesters',
    path: 'admin/semesters',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Dashboard',
    path: 'faculty',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'My Courses',
    path: 'faculty/courses',
    icon: <BookMarked className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'Attendance',
    path: 'faculty/attendance',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'Grades',
    path: 'faculty/grades',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'Schedule',
    path: 'faculty/schedule',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'Dashboard',
    path: 'student',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'My Courses',
    path: 'student/courses',
    icon: <BookMarked className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'Attendance',
    path: 'student/attendance',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'Grades',
    path: 'student/grades',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'Profile',
    path: 'student/profile',
    icon: <Users className="w-5 h-5" />,
    roles: ['student'],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const isActive = (path: string) => location.pathname === `/${path}`;

  return (
    <div className="min-h-screen bg-[#f5f0ff]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-600 transition-all duration-500 ease-in-out z-30 shadow-2xl shadow-purple-500/30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 rounded-r-3xl`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center py-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-4">
          <div className="space-y-2">
            {filteredNavItems.map((item, index) => (
              <Link
                key={`nav-${index}-${item.path}`}
                to={`/${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white text-purple-600 shadow-lg shadow-purple-500/20'
                    : 'text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className={`transition-all duration-300 ${isActive(item.path) ? 'text-purple-600' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/20 hover:text-white rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-transparent py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-purple-600 hover:bg-purple-100 focus:outline-none lg:hidden transition-all duration-200"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-white border border-purple-100 rounded-full py-2.5 px-5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Right Side - User & Notifications */}
            <div className="flex items-center gap-4">
              {/* Notification Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Page Transition Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
