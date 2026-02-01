// Type definitions for College Management System

export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Department {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headOfDepartment?: { _id: string; name: string; employeeId: string } | string;
  establishedYear?: number;
  createdAt: string;
}

export interface Program {
  _id: string;
  code: string;
  name: string;
  department: { _id: string; name: string; code: string } | string;
  duration: number;
  degreeType: 'Bachelor' | 'Master' | 'Doctorate' | 'Diploma' | 'Certificate';
  totalCredits: number;
  totalSemesters: number;
  description?: string;
  eligibility?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface Student {
  _id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  program: { _id: string; name: string; code: string } | string;
  department: { _id: string; name: string; code: string } | string;
  currentSemester: number;
  admissionYear: number;
  batchYear?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  guardian?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  cgpa?: number;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  createdAt: string;
}

export interface Faculty {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: { _id: string; name: string; code: string } | string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Teaching Assistant';
  qualification?: string;
  specialization?: string;
  experience?: number;
  dateOfJoining: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  salary?: number;
  status?: 'Active' | 'On Leave' | 'Resigned' | 'Retired';
  createdAt: string;
}

export interface Course {
  _id: string;
  code: string;
  name: string;
  credits: number;
  department: { _id: string; name: string; code: string } | string;
  program: { _id: string; name: string; code: string } | string;
  semester: { _id: string; name: string; code?: string; academicYear?: string } | string;
  faculty?: { _id: string; name: string; employeeId: string } | string;
  semesterNumber: number;
  description: string;
  type?: string;
  syllabus?: string;
  lectureHours?: number;
  tutorialHours?: number;
  practicalHours?: number;
  internalMarks?: number;
  externalMarks?: number;
  totalMarks?: number;
  passingMarks?: number;
  maxCapacity?: number;
  currentEnrollment?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface Semester {
  _id: string;
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
  student: { _id: string; name: string; rollNumber: string } | string;
  course: { _id: string; name: string; code: string } | string;
  semester: { _id: string; name: string } | string;
  enrollmentDate?: string;
  status: 'Enrolled' | 'Dropped' | 'Completed' | 'Failed';
  grade?: string;
  createdAt: string;
}

export interface Attendance {
  _id: string;
  student: { _id: string; name: string; rollNumber: string } | string;
  course: { _id: string; name: string; code: string } | string;
  semester?: { _id: string; name: string } | string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  markedBy?: { _id: string; name: string } | string;
  remarks?: string;
  createdAt: string;
}

export interface Exam {
  _id: string;
  name: string;
  course: { _id: string; name: string; code: string } | string;
  semester: { _id: string; name: string } | string;
  type: 'Quiz' | 'Assignment' | 'Mid-Term' | 'End-Term' | 'Lab' | 'Project' | 'Viva' | 'Practical';
  category: 'Internal' | 'External';
  maxMarks: number;
  passingMarks: number;
  weightage?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  venue?: string;
  instructions?: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  isPublished?: boolean;
  createdAt: string;
}

export interface Mark {
  _id: string;
  student: { _id: string; name: string; rollNumber: string } | string;
  course: { _id: string; name: string; code: string } | string;
  exam: { _id: string; name: string; type: string } | string;
  marksObtained: number;
  maxMarks: number;
  percentage?: number;
  grade?: string;
  isPassed?: boolean;
  remarks?: string;
  enteredBy?: { _id: string; name: string } | string;
  isPublished?: boolean;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday' | 'Urgent' | 'Other';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  targetRoles: UserRole[];
  targetDepartments?: string[];
  targetPrograms?: string[];
  createdBy: { _id: string; name: string } | string;
  publishDate?: string;
  expiryDate?: string;
  isActive: boolean;
  isPinned?: boolean;
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
  totalPages?: number;
  error?: string;
}
