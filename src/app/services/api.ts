/**
 * API Service Layer
 * Connects to the Express.js + MongoDB backend
 * Handles all HTTP requests with proper error handling and token management
 */

import type {
  ApiResponse,
  PaginatedResponse,
  Department,
  Program,
  Student,
  Faculty,
  Course,
  Semester,
  Announcement,
  Enrollment,
  Attendance,
  Exam,
  Mark,
  User,
} from '../types';

// API Base URL - change this to match your backend
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// HTTP Client Helper Functions
// ============================================

/**
 * Get authentication token from localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set authentication token in localStorage
 */
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token from localStorage
 */
const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Get default headers for API requests
 */
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response and errors
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    // Extract validation errors if available
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ');
      throw new Error(errorMessages || data.message || 'Validation failed');
    }
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

/**
 * Make a GET request
 */
const get = async <T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<T>(response);
};

/**
 * Make a POST request
 */
const post = async <T>(endpoint: string, data?: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
};

/**
 * Make a PUT request
 */
const put = async <T>(endpoint: string, data?: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
};

/**
 * Make a DELETE request
 */
const del = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse<T>(response);
};

// ============================================
// Authentication API
// ============================================
export const authApi = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
        '/auth/login',
        { email, password }
      );

      if (response.success && response.data.token) {
        setToken(response.data.token);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  },

  /**
   * Register user (admin only)
   */
  register: async (userData: { email: string; password: string; name: string; role: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', userData);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await get<{ success: boolean; data: { user: User } }>('/auth/me');
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get user' };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: { name?: string; email?: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await put<{ success: boolean; data: { user: User } }>('/auth/profile', data);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    try {
      await put('/auth/password', { currentPassword, newPassword });
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Password change failed' };
    }
  },

  /**
   * Logout user
   */
  logout: (): void => {
    removeToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// ============================================
// Departments API
// ============================================
export const departmentsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Department>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Department[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/departments', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch departments',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Department>> => {
    try {
      const response = await get<{ success: boolean; data: Department }>(`/departments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch department' };
    }
  },

  create: async (data: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Department>> => {
    try {
      const response = await post<{ success: boolean; data: Department }>('/departments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create department' };
    }
  },

  update: async (id: string, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    try {
      const response = await put<{ success: boolean; data: Department }>(`/departments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update department' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/departments/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete department' };
    }
  },

  getStats: async (id: string): Promise<ApiResponse<{ programs: number; faculty: number; students: number; courses: number }>> => {
    try {
      const response = await get<{ success: boolean; data: any }>(`/departments/${id}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' };
    }
  },
};

// ============================================
// Programs API
// ============================================
export const programsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; department?: string }): Promise<PaginatedResponse<Program>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Program[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/programs', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch programs',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Program>> => {
    try {
      const response = await get<{ success: boolean; data: Program }>(`/programs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch program' };
    }
  },

  getByDepartment: async (departmentId: string): Promise<ApiResponse<Program[]>> => {
    try {
      const response = await get<{ success: boolean; data: Program[] }>(`/programs/department/${departmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch programs' };
    }
  },

  create: async (data: Omit<Program, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Program>> => {
    try {
      const response = await post<{ success: boolean; data: Program }>('/programs', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create program' };
    }
  },

  update: async (id: string, data: Partial<Program>): Promise<ApiResponse<Program>> => {
    try {
      const response = await put<{ success: boolean; data: Program }>(`/programs/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update program' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/programs/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete program' };
    }
  },
};

// ============================================
// Faculty API
// ============================================
export const facultyApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; department?: string }): Promise<PaginatedResponse<Faculty>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Faculty[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/faculty', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch faculty',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Faculty>> => {
    try {
      const response = await get<{ success: boolean; data: Faculty }>(`/faculty/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch faculty' };
    }
  },

  getByDepartment: async (departmentId: string): Promise<ApiResponse<Faculty[]>> => {
    try {
      const response = await get<{ success: boolean; data: Faculty[] }>(`/faculty/department/${departmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch faculty' };
    }
  },

  getCourses: async (id: string): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await get<{ success: boolean; data: Course[] }>(`/faculty/${id}/courses`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch courses' };
    }
  },

  create: async (data: Omit<Faculty, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Faculty>> => {
    try {
      const response = await post<{ success: boolean; data: Faculty }>('/faculty', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create faculty' };
    }
  },

  update: async (id: string, data: Partial<Faculty>): Promise<ApiResponse<Faculty>> => {
    try {
      const response = await put<{ success: boolean; data: Faculty }>(`/faculty/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update faculty' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/faculty/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete faculty' };
    }
  },
};

// ============================================
// Students API
// ============================================
export const studentsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; department?: string; program?: string }): Promise<PaginatedResponse<Student>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Student[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/students', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch students',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Student>> => {
    try {
      const response = await get<{ success: boolean; data: Student }>(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch student' };
    }
  },

  getByProgram: async (programId: string): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await get<{ success: boolean; data: Student[] }>(`/students/program/${programId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch students' };
    }
  },

  getEnrollments: async (id: string): Promise<ApiResponse<Enrollment[]>> => {
    try {
      const response = await get<{ success: boolean; data: Enrollment[] }>(`/students/${id}/enrollments`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch enrollments' };
    }
  },

  getAttendance: async (id: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/students/${id}/attendance`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch attendance' };
    }
  },

  getMarks: async (id: string): Promise<ApiResponse<Mark[]>> => {
    try {
      const response = await get<{ success: boolean; data: Mark[] }>(`/students/${id}/marks`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch marks' };
    }
  },

  create: async (data: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> => {
    try {
      const response = await post<{ success: boolean; data: Student }>('/students', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create student' };
    }
  },

  update: async (id: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
    try {
      const response = await put<{ success: boolean; data: Student }>(`/students/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update student' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/students/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete student' };
    }
  },
};

// ============================================
// Semesters API
// ============================================
export const semestersApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Semester>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Semester[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/semesters', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch semesters',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getCurrent: async (): Promise<ApiResponse<Semester>> => {
    try {
      const response = await get<{ success: boolean; data: Semester }>('/semesters/current');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch current semester' };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Semester>> => {
    try {
      const response = await get<{ success: boolean; data: Semester }>(`/semesters/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch semester' };
    }
  },

  create: async (data: Omit<Semester, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Semester>> => {
    try {
      const response = await post<{ success: boolean; data: Semester }>('/semesters', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create semester' };
    }
  },

  update: async (id: string, data: Partial<Semester>): Promise<ApiResponse<Semester>> => {
    try {
      const response = await put<{ success: boolean; data: Semester }>(`/semesters/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update semester' };
    }
  },

  setCurrent: async (id: string): Promise<ApiResponse<Semester>> => {
    try {
      const response = await put<{ success: boolean; data: Semester }>(`/semesters/${id}/set-current`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to set current semester' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/semesters/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete semester' };
    }
  },
};

// ============================================
// Courses API
// ============================================
export const coursesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; department?: string; semester?: string }): Promise<PaginatedResponse<Course>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Course[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/courses', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await get<{ success: boolean; data: Course }>(`/courses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch course' };
    }
  },

  getStudents: async (id: string): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await get<{ success: boolean; data: Student[] }>(`/courses/${id}/students`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch students' };
    }
  },

  create: async (data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Course>> => {
    try {
      const response = await post<{ success: boolean; data: Course }>('/courses', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create course' };
    }
  },

  update: async (id: string, data: Partial<Course>): Promise<ApiResponse<Course>> => {
    try {
      const response = await put<{ success: boolean; data: Course }>(`/courses/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update course' };
    }
  },

  assignFaculty: async (id: string, facultyId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await put<{ success: boolean; data: Course }>(`/courses/${id}/assign-faculty`, { facultyId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to assign faculty' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/courses/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete course' };
    }
  },
};

// ============================================
// Enrollments API
// ============================================
export const enrollmentsApi = {
  getAll: async (params?: { student?: string; course?: string; semester?: string }): Promise<ApiResponse<Enrollment[]>> => {
    try {
      const response = await get<{ success: boolean; data: Enrollment[] }>('/enrollments', params as Record<string, string>);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch enrollments' };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Enrollment>> => {
    try {
      const response = await get<{ success: boolean; data: Enrollment }>(`/enrollments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch enrollment' };
    }
  },

  create: async (data: { student: string; course: string; semester: string }): Promise<ApiResponse<Enrollment>> => {
    try {
      const response = await post<{ success: boolean; data: Enrollment }>('/enrollments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create enrollment' };
    }
  },

  bulkEnroll: async (data: { students: string[]; course: string; semester: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await post<{ success: boolean; data: any }>('/enrollments/bulk', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to bulk enroll' };
    }
  },

  update: async (id: string, data: Partial<Enrollment>): Promise<ApiResponse<Enrollment>> => {
    try {
      const response = await put<{ success: boolean; data: Enrollment }>(`/enrollments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update enrollment' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/enrollments/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete enrollment' };
    }
  },
};

// ============================================
// Attendance API
// ============================================
export const attendanceApi = {
  getAll: async (params?: { course?: string; student?: string; date?: string }): Promise<ApiResponse<Attendance[]>> => {
    try {
      const response = await get<{ success: boolean; data: Attendance[] }>('/attendance', params as Record<string, string>);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch attendance' };
    }
  },

  getCourseAttendance: async (courseId: string, date: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/attendance/course/${courseId}/date/${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch attendance' };
    }
  },

  markAttendance: async (data: { student: string; course: string; date: string; status: string }): Promise<ApiResponse<Attendance>> => {
    try {
      const response = await post<{ success: boolean; data: Attendance }>('/attendance', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to mark attendance' };
    }
  },

  markBulkAttendance: async (data: { course: string; date: string; records: { student: string; status: string }[] }): Promise<ApiResponse<any>> => {
    try {
      const response = await post<{ success: boolean; data: any }>('/attendance/bulk', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to mark attendance' };
    }
  },

  getCourseSummary: async (courseId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/attendance/summary/course/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch summary' };
    }
  },

  getStudentSummary: async (studentId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await get<{ success: boolean; data: any[] }>(`/attendance/summary/student/${studentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch summary' };
    }
  },
};

// ============================================
// Exams API
// ============================================
export const examsApi = {
  getAll: async (params?: { course?: string; semester?: string }): Promise<ApiResponse<Exam[]>> => {
    try {
      const response = await get<{ success: boolean; data: Exam[] }>('/exams', params as Record<string, string>);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch exams' };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Exam>> => {
    try {
      const response = await get<{ success: boolean; data: Exam }>(`/exams/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch exam' };
    }
  },

  getByCourse: async (courseId: string): Promise<ApiResponse<Exam[]>> => {
    try {
      const response = await get<{ success: boolean; data: Exam[] }>(`/exams/course/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch exams' };
    }
  },

  create: async (data: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Exam>> => {
    try {
      const response = await post<{ success: boolean; data: Exam }>('/exams', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create exam' };
    }
  },

  update: async (id: string, data: Partial<Exam>): Promise<ApiResponse<Exam>> => {
    try {
      const response = await put<{ success: boolean; data: Exam }>(`/exams/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update exam' };
    }
  },

  publishResults: async (id: string): Promise<ApiResponse<Exam>> => {
    try {
      const response = await put<{ success: boolean; data: Exam }>(`/exams/${id}/publish`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to publish results' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/exams/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete exam' };
    }
  },
};

// ============================================
// Marks API
// ============================================
export const marksApi = {
  getAll: async (params?: { student?: string; course?: string; exam?: string }): Promise<ApiResponse<Mark[]>> => {
    try {
      const response = await get<{ success: boolean; data: Mark[] }>('/marks', params as Record<string, string>);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch marks' };
    }
  },

  getExamMarks: async (examId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>(`/marks/exam/${examId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch marks' };
    }
  },

  enterMark: async (data: { student: string; course: string; exam: string; marksObtained: number }): Promise<ApiResponse<Mark>> => {
    try {
      const response = await post<{ success: boolean; data: Mark }>('/marks', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to enter mark' };
    }
  },

  enterBulkMarks: async (data: { exam: string; course: string; marks: { student: string; marksObtained: number }[] }): Promise<ApiResponse<any>> => {
    try {
      const response = await post<{ success: boolean; data: any }>('/marks/bulk', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to enter marks' };
    }
  },

  getStudentSummary: async (studentId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>(`/marks/student/${studentId}/summary`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch summary' };
    }
  },
};

// ============================================
// Announcements API
// ============================================
export const announcementsApi = {
  getAll: async (params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<Announcement>> => {
    try {
      const response = await get<{
        success: boolean;
        data: Announcement[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/announcements', params as Record<string, string | number>);

      return {
        success: true,
        data: response.data,
        total: response.total,
        page: response.currentPage,
        limit: params?.limit || 10,
        totalPages: response.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch announcements',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getActive: async (): Promise<ApiResponse<Announcement[]>> => {
    try {
      const response = await get<{ success: boolean; data: Announcement[] }>('/announcements/active');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch announcements' };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Announcement>> => {
    try {
      const response = await get<{ success: boolean; data: Announcement }>(`/announcements/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch announcement' };
    }
  },

  create: async (data: Omit<Announcement, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Announcement>> => {
    try {
      const response = await post<{ success: boolean; data: Announcement }>('/announcements', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create announcement' };
    }
  },

  update: async (id: string, data: Partial<Announcement>): Promise<ApiResponse<Announcement>> => {
    try {
      const response = await put<{ success: boolean; data: Announcement }>(`/announcements/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update announcement' };
    }
  },

  togglePin: async (id: string): Promise<ApiResponse<Announcement>> => {
    try {
      const response = await put<{ success: boolean; data: Announcement }>(`/announcements/${id}/toggle-pin`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle pin' };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await del(`/announcements/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete announcement' };
    }
  },
};

// ============================================
// Dashboard API
// ============================================
export const dashboardApi = {
  getAdminDashboard: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/admin');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },

  // Alias for backwards compatibility
  getAdminStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/admin');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },

  getFacultyDashboard: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/faculty');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },

  // Alias for backwards compatibility - faculty ID is obtained from JWT token on backend
  getFacultyStats: async (_facultyId?: string): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/faculty');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },

  getStudentDashboard: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/student');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },

  // Alias for backwards compatibility - student ID is obtained from JWT token on backend
  getStudentStats: async (_studentId?: string): Promise<ApiResponse<any>> => {
    try {
      const response = await get<{ success: boolean; data: any }>('/dashboard/student');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard' };
    }
  },
};
