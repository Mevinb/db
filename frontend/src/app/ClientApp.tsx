'use client';

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import DashboardLayout from '@/app/components/DashboardLayout';
import Login from '@/app/pages/Login';
import Dashboard from '@/app/pages/admin/Dashboard';
import DepartmentManagement from '@/app/pages/admin/DepartmentManagement';
import ProgramManagement from '@/app/pages/admin/ProgramManagement';
import FacultyManagement from '@/app/pages/admin/FacultyManagement';
import StudentManagement from '@/app/pages/admin/StudentManagement';
import CourseManagement from '@/app/pages/admin/CourseManagement';
import SemesterManagement from '@/app/pages/admin/SemesterManagement';
import AnnouncementManagement from '@/app/pages/admin/AnnouncementManagement';
import EnrollmentManagement from '@/app/pages/admin/EnrollmentManagement';
import UserManagement from '@/app/pages/admin/UserManagement';
import FacultyDashboard from '@/app/pages/faculty/Dashboard';
import FacultyMyCourses from '@/app/pages/faculty/MyCourses';
import FacultyExamManagement from '@/app/pages/faculty/ExamManagement';
import FacultyAttendance from '@/app/pages/faculty/Attendance';
import FacultyGrades from '@/app/pages/faculty/Grades';
import StudentDashboard from '@/app/pages/student/Dashboard';
import StudentCourses from '@/app/pages/student/Courses';
import StudentAttendance from '@/app/pages/student/Attendance';
import StudentGrades from '@/app/pages/student/Grades';
import StudentAnnouncements from '@/app/pages/student/Announcements';

// Layout wrapper that renders DashboardLayout with an Outlet
const DashboardLayoutWrapper: React.FC = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayoutWrapper />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="programs" element={<ProgramManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="semesters" element={<SemesterManagement />} />
        <Route path="announcements" element={<AnnouncementManagement />} />
        <Route path="enrollments" element={<EnrollmentManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <DashboardLayoutWrapper />
        </ProtectedRoute>
      }>
        <Route index element={<FacultyDashboard />} />
        <Route path="courses" element={<FacultyMyCourses />} />
        <Route path="exams" element={<FacultyExamManagement />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="grades" element={<FacultyGrades />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayoutWrapper />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function ClientApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
