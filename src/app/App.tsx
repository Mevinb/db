import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { Toaster } from '@/app/components/ui/sonner';
import Login from '@/app/pages/Login';
import AdminDashboard from '@/app/pages/admin/Dashboard';
import FacultyDashboard from '@/app/pages/faculty/Dashboard';
import StudentDashboard from '@/app/pages/student/Dashboard';

// Lazy load management pages
const DepartmentManagement = React.lazy(() => import('@/app/pages/admin/DepartmentManagement'));
const ProgramManagement = React.lazy(() => import('@/app/pages/admin/ProgramManagement'));
const StudentManagement = React.lazy(() => import('@/app/pages/admin/StudentManagement'));
const FacultyManagement = React.lazy(() => import('@/app/pages/admin/FacultyManagement'));
const CourseManagement = React.lazy(() => import('@/app/pages/admin/CourseManagement'));
const SemesterManagement = React.lazy(() => import('@/app/pages/admin/SemesterManagement'));

// Faculty pages
const FacultyCourses = React.lazy(() => import('@/app/pages/faculty/Courses'));
const FacultyAttendance = React.lazy(() => import('@/app/pages/faculty/Attendance'));
const FacultyGrades = React.lazy(() => import('@/app/pages/faculty/Grades'));
const FacultySchedule = React.lazy(() => import('@/app/pages/faculty/Schedule'));

// Student pages
const StudentCourses = React.lazy(() => import('@/app/pages/student/Courses'));
const StudentCourseDetails = React.lazy(() => import('@/app/pages/student/CourseDetails'));
const StudentAttendance = React.lazy(() => import('@/app/pages/student/Attendance'));
const StudentGrades = React.lazy(() => import('@/app/pages/student/Grades'));
const StudentProfile = React.lazy(() => import('@/app/pages/student/Profile'));

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/student'} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProgramManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FacultyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/semesters"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SemesterManagement />
            </ProtectedRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/courses"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/grades"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/schedule"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultySchedule />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl mb-4">403</h1>
                <p className="text-gray-600">Unauthorized Access</p>
              </div>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl mb-4">404</h1>
                <p className="text-gray-600">Page Not Found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
