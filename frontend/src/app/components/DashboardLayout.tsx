import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { logsApi, authApi, announcementsApi } from '@/app/services/api';
import type { ServerLogEntry } from '@/app/services/api';
import type { Announcement } from '@/app/types';
import { toast } from 'sonner';
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
  Sparkles,
  User as UserIcon,
  KeyRound,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
  Trash2,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Megaphone,
  ClipboardList,
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
    label: 'Enrollments',
    path: 'admin/enrollments',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Announcements',
    path: 'admin/announcements',
    icon: <Megaphone className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Users',
    path: 'admin/users',
    icon: <Shield className="w-5 h-5" />,
    roles: ['admin'],
  },
  // Faculty navigation items
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
    label: 'Exams',
    path: 'faculty/exams',
    icon: <Calendar className="w-5 h-5" />,
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
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['faculty'],
  },
  // Student navigation items
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
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'Grades',
    path: 'student/grades',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    label: 'Announcements',
    path: 'student/announcements',
    icon: <Bell className="w-5 h-5" />,
    roles: ['student'],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logs, setLogs] = useState<ServerLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenRef = useRef<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Announcement notification state (for faculty & student)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementUnread, setAnnouncementUnread] = useState(0);
  const lastSeenAnnouncementRef = useRef<string | null>(null);
  const announcementNotifRef = useRef<HTMLDivElement>(null);

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Change password dialog state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Close notification panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (announcementNotifRef.current && !announcementNotifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const fetchLogs = useCallback(async () => {
    if (user?.role !== 'admin') return;
    setLogsLoading(true);
    try {
      const res = await logsApi.getAll({ limit: 50 });
      if (res.success && res.data) {
        setLogs(res.data);
        // Count new logs since last seen
        if (lastSeenRef.current) {
          const newCount = res.data.filter(
            (l) => new Date(l.timestamp) > new Date(lastSeenRef.current!)
          ).length;
          setUnreadCount(newCount);
        } else {
          setUnreadCount(res.data.length > 0 ? res.data.length : 0);
        }
      }
    } catch {
      // silent
    } finally {
      setLogsLoading(false);
    }
  }, [user?.role]);

  // Poll logs every 10 seconds for admin
  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs, user?.role]);

  // Fetch announcements for non-admin users
  const fetchAnnouncements = useCallback(async () => {
    if (user?.role === 'admin') return;
    setAnnouncementsLoading(true);
    try {
      const res = await announcementsApi.getActive();
      if (res.success && res.data) {
        setAnnouncements(res.data);
        if (lastSeenAnnouncementRef.current) {
          const newCount = res.data.filter(
            (a) => new Date(a.createdAt) > new Date(lastSeenAnnouncementRef.current!)
          ).length;
          setAnnouncementUnread(newCount);
        } else {
          setAnnouncementUnread(res.data.length > 0 ? res.data.length : 0);
        }
      }
    } catch {
      // silent
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [user?.role]);

  // Poll announcements every 30 seconds for non-admin
  useEffect(() => {
    if (user?.role === 'admin') return;
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements, user?.role]);

  const handleOpenAnnouncementNotifications = () => {
    setNotifOpen((prev) => {
      if (!prev) {
        if (announcements.length > 0) {
          lastSeenAnnouncementRef.current = announcements[0].createdAt;
        }
        setAnnouncementUnread(0);
        fetchAnnouncements();
      }
      return !prev;
    });
  };

  const handleOpenNotifications = () => {
    setNotifOpen((prev) => {
      if (!prev) {
        // Mark as seen
        if (logs.length > 0) {
          lastSeenRef.current = logs[0].timestamp;
        }
        setUnreadCount(0);
        fetchLogs();
      }
      return !prev;
    });
  };

  const handleClearLogs = async () => {
    await logsApi.clear();
    setLogs([]);
    setUnreadCount(0);
  };

  // Profile handlers
  const openProfileDialog = () => {
    setProfileName(user?.name || '');
    setProfileEmail(user?.email || '');
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profileEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await authApi.updateProfile({ name: profileName.trim(), email: profileEmail.trim() } as any);
      if (res.success) {
        updateUser({ name: profileName.trim(), email: profileEmail.trim() });
        toast.success('Profile updated successfully');
        setProfileOpen(false);
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password handlers
  const openPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success('Password changed successfully');
        setPasswordOpen(false);
      } else {
        toast.error(res.error || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const isActive = (path: string) => {
    const fullPath = `/${path}`;
    // Exact match for dashboard root paths, startsWith for sub-paths
    if (fullPath === '/admin' || fullPath === '/faculty' || fullPath === '/student') {
      return location.pathname === fullPath;
    }
    return location.pathname.startsWith(fullPath);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 fixed top-0 left-0 right-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    EduPortal
                  </span>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell — admin only shows server logs */}
              {user?.role === 'admin' ? (
                <div className="relative" ref={notifRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all"
                    onClick={handleOpenNotifications}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Notification dropdown panel */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-[420px] max-h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                        <h3 className="text-sm font-semibold text-gray-800">Server Logs</h3>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-200 rounded-lg" onClick={fetchLogs} disabled={logsLoading}>
                            <RefreshCw className={`h-3.5 w-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-100 hover:text-red-600 rounded-lg" onClick={handleClearLogs}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {logs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Bell className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">No server logs yet</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-50">
                            {logs.map((log) => (
                              <li key={log.id} className="px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5">
                                    {log.level === 'error' ? (
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    ) : log.level === 'warn' ? (
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    ) : log.level === 'debug' ? (
                                      <Bug className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Info className="h-4 w-4 text-blue-400" />
                                    )}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-800 font-mono break-all leading-relaxed">
                                      {log.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      {new Date(log.timestamp).toLocaleTimeString()} &middot;{' '}
                                      <span
                                        className={
                                          log.level === 'error'
                                            ? 'text-red-400'
                                            : log.level === 'warn'
                                            ? 'text-amber-400'
                                            : 'text-gray-400'
                                        }
                                      >
                                        {log.level.toUpperCase()}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" ref={announcementNotifRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all"
                    onClick={handleOpenAnnouncementNotifications}
                  >
                    <Bell className="h-5 w-5" />
                    {announcementUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {announcementUnread > 99 ? '99+' : announcementUnread}
                      </span>
                    )}
                  </Button>

                  {/* Announcement notification dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-[400px] max-h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                        <h3 className="text-sm font-semibold text-gray-800">Announcements</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-200 rounded-lg" onClick={fetchAnnouncements} disabled={announcementsLoading}>
                          <RefreshCw className={`h-3.5 w-3.5 ${announcementsLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Bell className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">No announcements</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-50">
                            {announcements.slice(0, 20).map((ann) => (
                              <li key={ann._id} className="px-4 py-3 hover:bg-gray-50/60 transition-colors">
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5">
                                    {ann.priority === 'Urgent' || ann.priority === 'High' ? (
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                    ) : ann.priority === 'Normal' ? (
                                      <Info className="h-4 w-4 text-blue-400" />
                                    ) : (
                                      <Info className="h-4 w-4 text-gray-400" />
                                    )}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-semibold text-gray-800 truncate">{ann.title}</p>
                                      {ann.isPinned && (
                                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">Pinned</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{ann.content}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-[10px] text-gray-400">
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                      </p>
                                      {ann.category && (
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                          {ann.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Avatar with profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-white shadow-lg cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all">
                        <AvatarFallback className="bg-transparent text-white font-semibold">
                          {user?.name ? getInitials(user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-1 rounded-xl shadow-xl border border-gray-200 bg-white p-0 overflow-hidden">
                    {/* Profile header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-white shadow">
                          <AvatarFallback className="bg-transparent text-white font-semibold text-lg">
                            {user?.name ? getInitials(user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer" onClick={() => navigate(`/${user?.role}`)}>
                        <LayoutDashboard className="h-4 w-4 text-gray-500" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer" onClick={openProfileDialog}>
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer" onClick={openPasswordDialog}>
                        <KeyRound className="h-4 w-4 text-gray-500" />
                        <span>Change Password</span>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem className="gap-2 px-4 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-gradient-to-b from-indigo-950 to-purple-950 transition-transform duration-300 ease-in-out z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-2xl`}
      >
        <div className="h-full overflow-y-auto py-6 px-4">
          <div className="mb-6">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-purple-100">Quick Access</span>
            </div>
          </div>
          
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={`/${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs text-purple-200">Version 1.0.0</p>
            <p className="text-xs text-purple-300">© 2026 EduPortal</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-2 animate-fade-in">{children}</div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-purple-600" />
              My Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-center">
              <Avatar className="h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-500 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-transparent text-white font-semibold text-2xl">
                  {profileName ? getInitials(profileName) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="profile-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-sm capitalize text-gray-700">{user?.role}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)} disabled={profileSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-purple-600 hover:bg-purple-700">
              {profileSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-600" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={passwordSaving}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordSaving} className="bg-purple-600 hover:bg-purple-700">
              {passwordSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardLayout;
