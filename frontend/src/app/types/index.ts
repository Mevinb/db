// Type definitions for College Management System

export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  _id: string;
  id?: string | number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profileId?: string;
}

export interface Department {
  _id: string;
  id?: string | number;
  code: string;
  name: string;
  description: string;
  headOfDepartment?: { _id: string; id?: string | number; name: string; employeeId: string } | string;
  hodName?: string;
  createdAt: string;
}

export interface Program {
  _id: string;
  id?: string | number;
  code: string;
  name: string;
  department: { _id: string; id?: string | number; name: string; code: string } | string;
  departmentId?: string | number;
  duration: number; // in years
  totalCredits: number;
  degreeType?: string;
  totalSemesters?: number;
  createdAt: string;
}

export interface Student {
  _id: string;
  id?: string | number;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  department: { _id: string; id?: string | number; name: string; code: string } | string;
  program: { _id: string; id?: string | number; name: string; code: string } | string;
  departmentId?: string | number;
  programId?: string | number;
  currentSemester: number;
  admissionYear: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  cgpa?: number;
  status?: string;
  createdAt: string;
}

export interface Faculty {
  _id: string;
  id?: string | number;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: { _id: string; id?: string | number; name: string; code: string } | string;
  departmentId?: string | number;
  designation: string;
  qualification: string;
  specialization: string;
  joiningDate?: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  id?: string | number;
  code: string;
  name: string;
  credits: number;
  department: { _id: string; id?: string | number; name: string; code: string } | string;
  program?: { _id: string; id?: string | number; name: string; code: string } | string;
  semester: { _id: string; id?: string | number; name: string; code: string } | string | number;
  semesterNumber?: number;
  faculty?: { _id: string; id?: string | number; name: string; employeeId: string } | string;
  departmentId?: string | number;
  programId?: string | number;
  semesterId?: string | number;
  facultyId?: string | number;
  description?: string;
  type?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface Semester {
  _id: string;
  id?: string | number;
  name: string;
  code: string;
  academicYear: string;
  semesterNumber: 1 | 2;
  startDate: string;
  endDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  isCurrent: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  id?: string | number;
  studentId: string;
  courseId: string;
  semesterId: string;
  enrollmentDate: string;
  status: 'active' | 'dropped' | 'completed';
  student?: any;
  createdAt: string;
}

export interface Attendance {
  _id: string;
  id?: string | number;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string; // faculty ID
  createdAt: string;
}

export interface Exam {
  _id: string;
  id?: string | number;
  name: string;
  courseId: string;
  semesterId: string;
  course?: any;
  semester?: any;
  date: string;
  maxMarks: number;
  type: 'midterm' | 'final' | 'quiz' | 'assignment' | string;
  createdAt: string;
}

export interface Mark {
  _id: string;
  id?: string | number;
  studentId: string;
  examId: string;
  courseId?: string;
  marksObtained: number;
  maxMarks?: number;
  grade?: string;
  remarks?: string;
  student?: any;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  id?: string | number;
  title: string;
  content: string;
  createdBy?: number | string;
  creator?: { name: string; email: string; role: string };
  postedBy?: string; // user ID
  targetRoles?: string[];
  targetRole?: UserRole;
  targetDepartments?: number[];
  targetPrograms?: number[];
  category?: 'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday' | 'Urgent' | 'Other' | string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent' | string;
  publishDate?: string;
  expiryDate?: string;
  isActive?: boolean;
  isPinned?: boolean;
  views?: number;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
