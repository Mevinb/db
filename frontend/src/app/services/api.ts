/**
 * API Service
 * Connects frontend to backend API endpoints
 */

import type { 
  User, 
  Department, 
  Program, 
  Student, 
  Faculty, 
  Course, 
  Semester,
  Enrollment,
  Attendance,
  Exam,
  Mark,
  Announcement,
  ApiResponse 
} from '@/app/types';

// API Base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('cms_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('cms_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('cms_token');
};

// Generic fetch wrapper with auth
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    const response = await apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setToken(response.data.token);
      // Transform backend response to match frontend User type
      const profile = response.data.user.profile;
      const user: User = {
        _id: String(response.data.user.id || response.data.user._id),
        email: response.data.user.email,
        name: response.data.user.name,
        role: response.data.user.role,
        profileId: profile ? String(profile.id || profile._id) : undefined,
      };
      return { success: true, data: user };
    }

    return { success: false, error: response.error };
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<ApiResponse<User>> => {
    const response = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      setToken(response.data.token);
      return { success: true, data: response.data.user };
    }

    return { success: false, error: response.error };
  },

  logout: (): void => {
    removeToken();
    localStorage.removeItem('cms_user');
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiFetch<User>('/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiFetch<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiFetch<any[]>('/auth/users?limit=1000');
    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map((u: any) => ({
        ...u,
        _id: String(u.id || u._id),
      }));
    }
    return response as ApiResponse<User[]>;
  },

  updateUser: async (id: string, data: Partial<User & { isActive?: boolean }>): Promise<ApiResponse<User>> => {
    return apiFetch<User>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// GENERIC CRUD API FACTORY
// ============================================
function createCrudApi<T extends { _id: string }>(endpoint: string) {
  return {
    getAll: async (): Promise<ApiResponse<T[]>> => {
      return apiFetch<T[]>(`${endpoint}?limit=100`);
    },

    getById: async (id: string): Promise<ApiResponse<T>> => {
      return apiFetch<T>(`${endpoint}/${id}`);
    },

    create: async (data: Omit<T, '_id' | 'createdAt'>): Promise<ApiResponse<T>> => {
      return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<T>): Promise<ApiResponse<T>> => {
      return apiFetch<T>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
      return apiFetch<void>(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

// ============================================
// DEPARTMENTS API
// ============================================
export const departmentsApi = {
  ...createCrudApi<Department>('/departments'),
  
  getStats: async (id: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/departments/${id}/stats`);
  },
};

// ============================================
// PROGRAMS API
// ============================================
export const programsApi = {
  ...createCrudApi<Program>('/programs'),

  getByDepartment: async (departmentId: string): Promise<ApiResponse<Program[]>> => {
    return apiFetch<Program[]>(`/programs/department/${departmentId}`);
  },
};

// ============================================
// STUDENTS API
// ============================================
export const studentsApi = {
  ...createCrudApi<Student>('/students'),

  getByProgram: async (programId: string): Promise<ApiResponse<Student[]>> => {
    return apiFetch<Student[]>(`/students/program/${programId}`);
  },

  getEnrollments: async (studentId: string): Promise<ApiResponse<Enrollment[]>> => {
    return apiFetch<Enrollment[]>(`/students/${studentId}/enrollments`);
  },

  getAttendance: async (studentId: string): Promise<ApiResponse<Attendance[]>> => {
    return apiFetch<Attendance[]>(`/students/${studentId}/attendance`);
  },

  getMarks: async (studentId: string): Promise<ApiResponse<Mark[]>> => {
    return apiFetch<Mark[]>(`/students/${studentId}/marks`);
  },
};

// ============================================
// FACULTY API
// ============================================
export const facultyApi = {
  ...createCrudApi<Faculty>('/faculty'),

  getByDepartment: async (departmentId: string): Promise<ApiResponse<Faculty[]>> => {
    return apiFetch<Faculty[]>(`/faculty/department/${departmentId}`);
  },

  getCourses: async (facultyId: string): Promise<ApiResponse<Course[]>> => {
    return apiFetch<Course[]>(`/faculty/${facultyId}/courses`);
  },
};

// ============================================
// COURSES API
// ============================================
export const coursesApi = {
  ...createCrudApi<Course>('/courses'),

  getStudents: async (courseId: string): Promise<ApiResponse<Student[]>> => {
    return apiFetch<Student[]>(`/courses/${courseId}/students`);
  },

  assignFaculty: async (courseId: string, facultyId: string): Promise<ApiResponse<Course>> => {
    return apiFetch<Course>(`/courses/${courseId}/assign-faculty`, {
      method: 'PUT',
      body: JSON.stringify({ facultyId }),
    });
  },
};

// ============================================
// SEMESTERS API
// ============================================
export const semestersApi = {
  ...createCrudApi<Semester>('/semesters'),

  getCurrent: async (): Promise<ApiResponse<Semester>> => {
    return apiFetch<Semester>('/semesters/current');
  },

  setCurrent: async (id: string): Promise<ApiResponse<Semester>> => {
    return apiFetch<Semester>(`/semesters/${id}/set-current`, {
      method: 'PUT',
    });
  },
};

// ============================================
// ENROLLMENTS API
// ============================================
export const enrollmentsApi = {
  ...createCrudApi<Enrollment>('/enrollments'),

  getAll: async (params?: { course?: string; student?: string; semester?: string; status?: string }): Promise<ApiResponse<Enrollment[]>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '100');
    if (params?.course) queryParams.append('course', params.course);
    if (params?.student) queryParams.append('student', params.student);
    if (params?.semester) queryParams.append('semester', params.semester);
    if (params?.status) queryParams.append('status', params.status);
    return apiFetch<Enrollment[]>(`/enrollments?${queryParams.toString()}`);
  },

  getByStudentCourse: async (studentId: string, courseId: string): Promise<ApiResponse<Enrollment>> => {
    return apiFetch<Enrollment>(`/enrollments/student/${studentId}/course/${courseId}`);
  },

  bulkEnroll: async (enrollments: Array<{ studentId: string; courseId: string; semesterId: string }>): Promise<ApiResponse<Enrollment[]>> => {
    return apiFetch<Enrollment[]>('/enrollments/bulk', {
      method: 'POST',
      body: JSON.stringify({ enrollments }),
    });
  },
};

// ============================================
// ATTENDANCE API
// ============================================
export const attendanceApi = {
  ...createCrudApi<Attendance>('/attendance'),

  getCourseAttendance: async (courseId: string, date: string): Promise<ApiResponse<Attendance[]>> => {
    return apiFetch<Attendance[]>(`/attendance/course/${courseId}/date/${date}`);
  },

  markBulk: async (attendances: Array<{ student: string; course: string; date: string; status: string }>): Promise<ApiResponse<any>> => {
    if (attendances.length === 0) {
      return { success: false, error: 'No attendance records to submit' };
    }
    // Group by course and date
    const courseId = attendances[0].course;
    const date = attendances[0].date;
    const records = attendances.map(a => ({
      studentId: a.student,
      status: a.status,
    }));
    
    return apiFetch<any>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ courseId, date, records }),
    });
  },

  getCourseSummary: async (courseId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/attendance/summary/course/${courseId}`);
  },

  getStudentSummary: async (studentId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/attendance/summary/student/${studentId}`);
  },
};

// ============================================
// EXAMS API
// ============================================
export const examsApi = {
  ...createCrudApi<Exam>('/exams'),

  getByCourse: async (courseId: string): Promise<ApiResponse<Exam[]>> => {
    return apiFetch<Exam[]>(`/exams/course/${courseId}`);
  },

  publishResults: async (examId: string): Promise<ApiResponse<Exam>> => {
    return apiFetch<Exam>(`/exams/${examId}/publish`, {
      method: 'PUT',
    });
  },
};

// ============================================
// MARKS API
// ============================================
export const marksApi = {
  ...createCrudApi<Mark>('/marks'),

  getExamMarks: async (examId: string): Promise<ApiResponse<Mark[]>> => {
    return apiFetch<Mark[]>(`/marks/exam/${examId}`);
  },

  enterBulk: async (marks: Array<{ student: string; exam: string; course: string; marksObtained: number }>): Promise<ApiResponse<any>> => {
    if (marks.length === 0) {
      return { success: false, error: 'No marks to submit' };
    }
    // Group by exam and course
    const examId = marks[0].exam;
    const courseId = marks[0].course;
    const marksData = marks.map(m => ({
      studentId: m.student,
      marksObtained: m.marksObtained,
    }));
    
    return apiFetch<any>('/marks/bulk', {
      method: 'POST',
      body: JSON.stringify({ examId, courseId, marks: marksData }),
    });
  },

  getStudentGradesSummary: async (studentId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>(`/marks/student/${studentId}/summary`);
  },
};

// ============================================
// ANNOUNCEMENTS API
// ============================================
export const announcementsApi = {
  ...createCrudApi<Announcement>('/announcements'),

  getActive: async (): Promise<ApiResponse<Announcement[]>> => {
    return apiFetch<Announcement[]>('/announcements/active');
  },

  togglePin: async (id: string): Promise<ApiResponse<Announcement>> => {
    return apiFetch<Announcement>(`/announcements/${id}/toggle-pin`, {
      method: 'PUT',
    });
  },
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getAdminDashboard: async (): Promise<ApiResponse<any>> => {
    return apiFetch<any>('/dashboard/admin');
  },

  getFacultyDashboard: async (): Promise<ApiResponse<any>> => {
    return apiFetch<any>('/dashboard/faculty');
  },

  getStudentDashboard: async (): Promise<ApiResponse<any>> => {
    return apiFetch<any>('/dashboard/student');
  },

  // Alias methods for backward compatibility
  getFacultyStats: async (facultyId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>('/dashboard/faculty');
  },

  getStudentStats: async (studentId: string): Promise<ApiResponse<any>> => {
    return apiFetch<any>('/dashboard/student');
  },
};

// ============================================
// LEGACY INTERFACES (for backward compatibility with older components)
// ============================================
export interface LegacyDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface LegacyProgram {
  id: string;
  name: string;
  departmentId: string;
  duration: number;
}

export interface LegacyStudent {
  id: string;
  name: string;
  email: string;
  programId: string;
  enrollmentDate: string;
  status: 'Active' | 'Graduated' | 'Suspended';
}

export interface LegacyFaculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
}

export interface LegacyCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  programId: string;
  semesterId?: string;
  description?: string;
}

export interface LegacySemester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ============================================
// LEGACY CRUD SERVICE (wraps real API for older components)
// ============================================
class LegacyCrudService<LegacyT extends { id: string }, ApiT extends { _id: string }> {
  private api: ReturnType<typeof createCrudApi<ApiT>>;
  private mapFromApi: (item: ApiT) => LegacyT;
  private mapToApi: (item: Omit<LegacyT, 'id'>) => Partial<ApiT>;

  constructor(
    api: ReturnType<typeof createCrudApi<ApiT>>,
    mapFromApi: (item: ApiT) => LegacyT,
    mapToApi: (item: Omit<LegacyT, 'id'>) => Partial<ApiT>
  ) {
    this.api = api;
    this.mapFromApi = mapFromApi;
    this.mapToApi = mapToApi;
  }

  async getAll(): Promise<LegacyT[]> {
    const response = await this.api.getAll();
    if (response.success && response.data) {
      return response.data.map(this.mapFromApi);
    }
    return [];
  }

  async getById(id: string): Promise<LegacyT | undefined> {
    const response = await this.api.getById(id);
    if (response.success && response.data) {
      return this.mapFromApi(response.data);
    }
    return undefined;
  }

  async create(item: Omit<LegacyT, 'id'>): Promise<LegacyT> {
    const apiData = this.mapToApi(item);
    const response = await this.api.create(apiData as any);
    if (response.success && response.data) {
      return this.mapFromApi(response.data);
    }
    throw new Error('Failed to create item');
  }

  async update(id: string, updates: Partial<LegacyT>): Promise<LegacyT | null> {
    const response = await this.api.update(id, updates as any);
    if (response.success && response.data) {
      return this.mapFromApi(response.data);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const response = await this.api.delete(id);
    return response.success;
  }
}

// Department mapping functions
const mapDepartmentFromApi = (dept: Department): LegacyDepartment => ({
  id: dept._id,
  name: dept.name,
  code: dept.code,
  description: dept.description,
});

const mapDepartmentToApi = (dept: Omit<LegacyDepartment, 'id'>): Partial<Department> => ({
  name: dept.name,
  code: dept.code,
  description: dept.description,
});

// Program mapping functions
const mapProgramFromApi = (prog: Program): LegacyProgram => ({
  id: prog._id,
  name: prog.name,
  departmentId: typeof prog.department === 'string' ? prog.department : prog.department?._id || '',
  duration: prog.duration,
});

const mapProgramToApi = (prog: Omit<LegacyProgram, 'id'>): Partial<Program> => ({
  name: prog.name,
  department: prog.departmentId as any,
  duration: prog.duration,
});

// Student mapping functions
const mapStudentFromApi = (stu: Student): LegacyStudent => ({
  id: stu._id,
  name: stu.name,
  email: stu.email,
  programId: typeof stu.program === 'string' ? stu.program : stu.program?._id || '',
  enrollmentDate: stu.createdAt,
  status: 'Active',
});

const mapStudentToApi = (stu: Omit<LegacyStudent, 'id'>): Partial<Student> => ({
  name: stu.name,
  email: stu.email,
  program: stu.programId as any,
});

// Faculty mapping functions
const mapFacultyFromApi = (fac: Faculty): LegacyFaculty => ({
  id: fac._id,
  name: fac.name,
  email: fac.email,
  departmentId: typeof fac.department === 'string' ? fac.department : fac.department?._id || '',
  designation: fac.designation as LegacyFaculty['designation'],
});

const mapFacultyToApi = (fac: Omit<LegacyFaculty, 'id'>): Partial<Faculty> => ({
  name: fac.name,
  email: fac.email,
  department: fac.departmentId as any,
  designation: fac.designation,
});

// Course mapping functions
const mapCourseFromApi = (crs: Course): LegacyCourse => ({
  id: crs._id,
  name: crs.name,
  code: crs.code,
  credits: crs.credits,
  programId: typeof crs.department === 'string' ? crs.department : crs.department?._id || '',
  description: crs.description,
});

const mapCourseToApi = (crs: Omit<LegacyCourse, 'id'>): Partial<Course> => ({
  name: crs.name,
  code: crs.code,
  credits: crs.credits,
  department: crs.programId as any,
  description: crs.description || '',
});

// Semester mapping functions
const mapSemesterFromApi = (sem: Semester): LegacySemester => ({
  id: sem._id,
  name: sem.name,
  startDate: sem.startDate,
  endDate: sem.endDate,
  isActive: sem.isCurrent,
});

const mapSemesterToApi = (sem: Omit<LegacySemester, 'id'>): Partial<Semester> => ({
  name: sem.name,
  startDate: sem.startDate,
  endDate: sem.endDate,
  isCurrent: sem.isActive,
});

// Export legacy services for backward compatibility with older components
export const departmentService = new LegacyCrudService<LegacyDepartment, Department>(
  departmentsApi,
  mapDepartmentFromApi,
  mapDepartmentToApi
);

export const programService = new LegacyCrudService<LegacyProgram, Program>(
  programsApi,
  mapProgramFromApi,
  mapProgramToApi
);

export const studentService = new LegacyCrudService<LegacyStudent, Student>(
  studentsApi,
  mapStudentFromApi,
  mapStudentToApi
);

export const facultyService = new LegacyCrudService<LegacyFaculty, Faculty>(
  facultyApi,
  mapFacultyFromApi,
  mapFacultyToApi
);

export const courseService = new LegacyCrudService<LegacyCourse, Course>(
  coursesApi,
  mapCourseFromApi,
  mapCourseToApi
);

export const semesterService = new LegacyCrudService<LegacySemester, Semester>(
  semestersApi,
  mapSemesterFromApi,
  mapSemesterToApi
);

// ============================================
// LOGS API (Admin only)
// ============================================
export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: Record<string, unknown>;
}

export const logsApi = {
  getAll: async (params?: { level?: string; limit?: number; since?: string }): Promise<ApiResponse<ServerLogEntry[]>> => {
    const query = new URLSearchParams();
    if (params?.level) query.set('level', params.level);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.since) query.set('since', params.since);
    const qs = query.toString();
    return apiFetch<ServerLogEntry[]>(`/logs${qs ? `?${qs}` : ''}`);
  },
  clear: async (): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/logs', { method: 'DELETE' });
  },
};

// Type aliases for backward compatibility
export type { LegacyDepartment as Department };
export type { LegacyProgram as Program };
export type { LegacyStudent as Student };
export type { LegacyFaculty as Faculty };
export type { LegacyCourse as Course };
export type { LegacySemester as Semester };
