// Mock data for development
import type {
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
} from '@/app/types';

// Mock Departments
export const mockDepartments: Department[] = [
  {
    _id: 'dept1',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    description: 'Department of Computer Science and Engineering',
    hodName: 'Dr. John Smith',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    _id: 'dept2',
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    description: 'Department of Electronics and Communication Engineering',
    hodName: 'Dr. Sarah Johnson',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    _id: 'dept3',
    code: 'ME',
    name: 'Mechanical Engineering',
    description: 'Department of Mechanical Engineering',
    hodName: 'Dr. Mike Brown',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
];

// Mock Programs
export const mockPrograms: Program[] = [
  {
    _id: 'prog1',
    code: 'BTECH-CSE',
    name: 'B.Tech in Computer Science',
    department: 'dept1',
    duration: 4,
    totalCredits: 160,
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    _id: 'prog2',
    code: 'MTECH-CSE',
    name: 'M.Tech in Computer Science',
    department: 'dept1',
    duration: 2,
    totalCredits: 80,
    createdAt: '2023-01-15T00:00:00.000Z',
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    _id: 'stu1',
    rollNumber: 'CSE2021001',
    name: 'Alice Williams',
    email: 'alice.w@college.edu',
    phone: '+1234567890',
    department: 'dept1',
    program: 'prog1',
    currentSemester: 6,
    admissionYear: 2021,
    dateOfBirth: '2003-05-15',
    address: '123 Main St, City, State',
    createdAt: '2021-08-01T00:00:00.000Z',
  },
  {
    _id: 'stu2',
    rollNumber: 'CSE2021002',
    name: 'Bob Martinez',
    email: 'bob.m@college.edu',
    phone: '+1234567891',
    department: 'dept1',
    program: 'prog1',
    currentSemester: 6,
    admissionYear: 2021,
    dateOfBirth: '2003-07-20',
    address: '456 Oak Ave, City, State',
    createdAt: '2021-08-01T00:00:00.000Z',
  },
];

// Mock Faculty
export const mockFaculty: Faculty[] = [
  {
    _id: 'fac1',
    employeeId: 'FAC001',
    name: 'Dr. Jane Cooper',
    email: 'jane.cooper@college.edu',
    phone: '+1234567892',
    department: 'dept1',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Machine Learning',
    joiningDate: '2018-07-01',
    createdAt: '2018-07-01T00:00:00.000Z',
  },
  {
    _id: 'fac2',
    employeeId: 'FAC002',
    name: 'Dr. Robert Lee',
    email: 'robert.lee@college.edu',
    phone: '+1234567893',
    department: 'dept1',
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Database Systems',
    joiningDate: '2015-08-01',
    createdAt: '2015-08-01T00:00:00.000Z',
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    _id: 'course1',
    code: 'CSE301',
    name: 'Database Management Systems',
    credits: 4,
    department: 'dept1',
    semester: 5,
    description: 'Introduction to database concepts, SQL, and DBMS design',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    _id: 'course2',
    code: 'CSE302',
    name: 'Machine Learning',
    credits: 4,
    department: 'dept1',
    semester: 6,
    description: 'Fundamentals of machine learning algorithms and applications',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
];

// Mock Semesters
export const mockSemesters: Semester[] = [
  {
    _id: 'sem1',
    name: 'Fall 2025',
    code: 'FALL2025',
    academicYear: '2025-2026',
    semesterNumber: 1,
    startDate: '2025-08-15',
    endDate: '2025-12-20',
    isCurrent: false,
    status: 'Completed',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    _id: 'sem2',
    name: 'Spring 2026',
    code: 'SPRING2026',
    academicYear: '2025-2026',
    semesterNumber: 2,
    startDate: '2026-01-10',
    endDate: '2026-05-25',
    isCurrent: true,
    status: 'Ongoing',
    createdAt: '2025-11-01T00:00:00.000Z',
  },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    _id: 'ann1',
    title: 'Mid-Semester Examination Schedule Released',
    content: 'The mid-semester examination schedule for Spring 2026 has been published. Please check your student portal for details.',
    postedBy: 'admin1',
    priority: 'high',
    createdAt: '2026-01-27T10:00:00.000Z',
  },
  {
    _id: 'ann2',
    title: 'Workshop on AI and ML',
    content: 'Department of CSE is organizing a 3-day workshop on Artificial Intelligence and Machine Learning. Registration open till Feb 5.',
    postedBy: 'admin1',
    targetRole: 'student',
    priority: 'medium',
    createdAt: '2026-01-25T14:30:00.000Z',
  },
];

// Mock Enrollments
export const mockEnrollments: Enrollment[] = [
  {
    _id: 'enr1',
    studentId: 'stu1',
    courseId: 'course2',
    semesterId: 'sem2',
    enrollmentDate: '2026-01-10',
    status: 'active',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
];

// Mock Attendance
export const mockAttendance: Attendance[] = [
  {
    _id: 'att1',
    studentId: 'stu1',
    courseId: 'course2',
    date: '2026-01-15',
    status: 'present',
    markedBy: 'fac1',
    createdAt: '2026-01-15T09:00:00.000Z',
  },
];

// Mock Exams
export const mockExams: Exam[] = [
  {
    _id: 'exam1',
    name: 'Mid-Term Exam',
    courseId: 'course2',
    semesterId: 'sem2',
    date: '2026-03-15',
    maxMarks: 50,
    type: 'midterm',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

// Mock Marks
export const mockMarks: Mark[] = [
  {
    _id: 'mark1',
    studentId: 'stu1',
    examId: 'exam1',
    marksObtained: 45,
    grade: 'A',
    remarks: 'Excellent performance',
    createdAt: '2026-03-20T00:00:00.000Z',
  },
];
