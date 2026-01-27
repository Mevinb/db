import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { coursesApi, enrollmentsApi } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { 
  BookOpen, 
  User, 
  Clock, 
  Calendar, 
  MapPin, 
  Award, 
  Target, 
  FileText, 
  ArrowLeft,
  GraduationCap,
  BookMarked,
  Users,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CourseData {
  id: string;
  name: string;
  code: string;
  instructor: string;
  instructorEmail: string;
  credits: number;
  schedule: string;
  room: string;
  progress: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  syllabus: { week: number; topic: string; description: string }[];
  assessmentBreakdown: { type: string; weightage: number }[];
  textbooks: { title: string; author: string; type: 'required' | 'reference' }[];
  officeHours: string;
  totalStudents: number;
}

const coursesData: Record<string, CourseData> = {
  '1': {
    id: '1',
    name: 'Data Structures',
    code: 'CS201',
    instructor: 'Dr. Rajesh Kumar',
    instructorEmail: 'rajesh.kumar@college.edu',
    credits: 4,
    schedule: 'Mon, Wed 9:00 AM - 10:30 AM',
    room: 'Room 101, Block A',
    progress: 75,
    description: 'This course provides a comprehensive introduction to data structures and their applications in computer science. Students will learn about various data structures including arrays, linked lists, stacks, queues, trees, graphs, and hash tables. The course emphasizes both the theoretical foundations and practical implementation of these structures.',
    objectives: [
      'Understand fundamental data structures and their implementations',
      'Analyze time and space complexity of algorithms',
      'Apply appropriate data structures to solve real-world problems',
      'Implement data structures in programming languages',
      'Design efficient algorithms using various data structures'
    ],
    prerequisites: [
      'CS101 - Introduction to Programming',
      'CS102 - Object-Oriented Programming',
      'MA101 - Discrete Mathematics'
    ],
    syllabus: [
      { week: 1, topic: 'Introduction to Data Structures', description: 'Overview of data structures, abstract data types, and algorithm analysis' },
      { week: 2, topic: 'Arrays and Strings', description: 'Array operations, multi-dimensional arrays, string manipulation' },
      { week: 3, topic: 'Linked Lists', description: 'Singly linked lists, doubly linked lists, circular linked lists' },
      { week: 4, topic: 'Stacks', description: 'Stack operations, applications, expression evaluation' },
      { week: 5, topic: 'Queues', description: 'Queue types, priority queues, deque' },
      { week: 6, topic: 'Trees - Part 1', description: 'Binary trees, tree traversals, binary search trees' },
      { week: 7, topic: 'Trees - Part 2', description: 'AVL trees, Red-Black trees, B-trees' },
      { week: 8, topic: 'Midterm Review & Exam', description: 'Review of all topics covered' },
      { week: 9, topic: 'Heaps', description: 'Binary heaps, heap operations, heap sort' },
      { week: 10, topic: 'Graphs - Part 1', description: 'Graph representations, BFS, DFS' },
      { week: 11, topic: 'Graphs - Part 2', description: 'Shortest path algorithms, minimum spanning trees' },
      { week: 12, topic: 'Hash Tables', description: 'Hashing techniques, collision resolution' },
      { week: 13, topic: 'Advanced Topics', description: 'Tries, segment trees, advanced applications' },
      { week: 14, topic: 'Final Review', description: 'Comprehensive review and exam preparation' },
    ],
    assessmentBreakdown: [
      { type: 'Assignments', weightage: 20 },
      { type: 'Quizzes', weightage: 10 },
      { type: 'Midterm Exam', weightage: 25 },
      { type: 'Final Exam', weightage: 35 },
      { type: 'Lab Work', weightage: 10 },
    ],
    textbooks: [
      { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', type: 'required' },
      { title: 'Data Structures and Algorithm Analysis in C++', author: 'Mark Allen Weiss', type: 'required' },
      { title: 'Algorithms', author: 'Robert Sedgewick', type: 'reference' },
    ],
    officeHours: 'Tuesday & Thursday, 2:00 PM - 4:00 PM',
    totalStudents: 45,
  },
  '2': {
    id: '2',
    name: 'Operating Systems',
    code: 'CS301',
    instructor: 'Dr. Priya Sharma',
    instructorEmail: 'priya.sharma@college.edu',
    credits: 4,
    schedule: 'Tue, Thu 11:00 AM - 12:30 PM',
    room: 'Room 203, Block B',
    progress: 60,
    description: 'This course covers the fundamental concepts of operating systems including process management, memory management, file systems, and I/O systems. Students will gain hands-on experience with system programming and understand how modern operating systems work.',
    objectives: [
      'Understand the structure and functions of operating systems',
      'Learn process scheduling and synchronization mechanisms',
      'Study memory management techniques including virtual memory',
      'Understand file system organization and implementation',
      'Explore I/O systems and device management'
    ],
    prerequisites: [
      'CS201 - Data Structures',
      'CS202 - Computer Organization',
    ],
    syllabus: [
      { week: 1, topic: 'Introduction to OS', description: 'OS concepts, types, and system calls' },
      { week: 2, topic: 'Process Management', description: 'Process concepts, scheduling algorithms' },
      { week: 3, topic: 'Threads', description: 'Multithreading models, thread libraries' },
      { week: 4, topic: 'Process Synchronization', description: 'Critical section, semaphores, monitors' },
      { week: 5, topic: 'Deadlocks', description: 'Deadlock prevention, avoidance, detection' },
      { week: 6, topic: 'Memory Management', description: 'Paging, segmentation, virtual memory' },
      { week: 7, topic: 'Virtual Memory', description: 'Page replacement algorithms, thrashing' },
      { week: 8, topic: 'Midterm Exam', description: 'Review and examination' },
      { week: 9, topic: 'File Systems', description: 'File system implementation, directory structure' },
      { week: 10, topic: 'I/O Systems', description: 'I/O hardware, disk scheduling' },
      { week: 11, topic: 'Protection & Security', description: 'Access control, authentication' },
      { week: 12, topic: 'Linux Internals', description: 'Linux kernel architecture, system programming' },
      { week: 13, topic: 'Case Studies', description: 'Windows, Linux, macOS comparison' },
      { week: 14, topic: 'Final Review', description: 'Comprehensive review' },
    ],
    assessmentBreakdown: [
      { type: 'Assignments', weightage: 15 },
      { type: 'Lab Projects', weightage: 20 },
      { type: 'Midterm Exam', weightage: 25 },
      { type: 'Final Exam', weightage: 30 },
      { type: 'Quizzes', weightage: 10 },
    ],
    textbooks: [
      { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', type: 'required' },
      { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', type: 'reference' },
    ],
    officeHours: 'Monday & Wednesday, 3:00 PM - 5:00 PM',
    totalStudents: 38,
  },
  '3': {
    id: '3',
    name: 'Database Systems',
    code: 'CS302',
    instructor: 'Dr. Amit Verma',
    instructorEmail: 'amit.verma@college.edu',
    credits: 3,
    schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
    room: 'Room 105, Block A',
    progress: 45,
    description: 'This course introduces the fundamental concepts of database systems, including data modeling, relational database design, SQL, transaction management, and database administration. Students will learn to design and implement efficient database solutions.',
    objectives: [
      'Understand relational database concepts and design principles',
      'Master SQL for data manipulation and querying',
      'Learn normalization and database design techniques',
      'Understand transaction management and concurrency control',
      'Gain experience with modern database systems'
    ],
    prerequisites: [
      'CS201 - Data Structures',
      'CS101 - Introduction to Programming',
    ],
    syllabus: [
      { week: 1, topic: 'Introduction to Databases', description: 'Database concepts, DBMS architecture' },
      { week: 2, topic: 'ER Modeling', description: 'Entity-Relationship diagrams, design principles' },
      { week: 3, topic: 'Relational Model', description: 'Relations, keys, relational algebra' },
      { week: 4, topic: 'SQL Basics', description: 'DDL, DML, basic queries' },
      { week: 5, topic: 'Advanced SQL', description: 'Joins, subqueries, views' },
      { week: 6, topic: 'Normalization', description: 'Functional dependencies, normal forms' },
      { week: 7, topic: 'Midterm Review & Exam', description: 'Review and examination' },
      { week: 8, topic: 'Indexing', description: 'B+ trees, hashing, index optimization' },
      { week: 9, topic: 'Transaction Management', description: 'ACID properties, concurrency control' },
      { week: 10, topic: 'Recovery', description: 'Logging, checkpointing, recovery algorithms' },
      { week: 11, topic: 'NoSQL Databases', description: 'MongoDB, key-value stores, document databases' },
      { week: 12, topic: 'Database Security', description: 'Access control, SQL injection prevention' },
      { week: 13, topic: 'Database Administration', description: 'Performance tuning, backup strategies' },
      { week: 14, topic: 'Final Review', description: 'Comprehensive review' },
    ],
    assessmentBreakdown: [
      { type: 'Assignments', weightage: 15 },
      { type: 'Project', weightage: 25 },
      { type: 'Midterm Exam', weightage: 20 },
      { type: 'Final Exam', weightage: 30 },
      { type: 'Lab Work', weightage: 10 },
    ],
    textbooks: [
      { title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', type: 'required' },
      { title: 'Fundamentals of Database Systems', author: 'Elmasri, Navathe', type: 'reference' },
    ],
    officeHours: 'Tuesday & Friday, 10:00 AM - 12:00 PM',
    totalStudents: 52,
  },
  '4': {
    id: '4',
    name: 'Computer Networks',
    code: 'CS303',
    instructor: 'Dr. Sneha Patel',
    instructorEmail: 'sneha.patel@college.edu',
    credits: 3,
    schedule: 'Tue, Thu 3:00 PM - 4:30 PM',
    room: 'Room 202, Block B',
    progress: 30,
    description: 'This course provides a comprehensive understanding of computer networking concepts, protocols, and technologies. Students will learn about network architectures, TCP/IP protocols, routing, network security, and modern networking technologies.',
    objectives: [
      'Understand network architectures and the OSI/TCP-IP models',
      'Learn about various networking protocols and their functions',
      'Study routing algorithms and network addressing',
      'Understand network security principles and practices',
      'Gain hands-on experience with network configuration and troubleshooting'
    ],
    prerequisites: [
      'CS201 - Data Structures',
      'CS202 - Computer Organization',
    ],
    syllabus: [
      { week: 1, topic: 'Introduction to Networks', description: 'Network types, topologies, OSI model' },
      { week: 2, topic: 'Physical Layer', description: 'Transmission media, encoding, multiplexing' },
      { week: 3, topic: 'Data Link Layer', description: 'Framing, error detection, MAC protocols' },
      { week: 4, topic: 'Network Layer - Part 1', description: 'IP addressing, subnetting, CIDR' },
      { week: 5, topic: 'Network Layer - Part 2', description: 'Routing algorithms, OSPF, BGP' },
      { week: 6, topic: 'Transport Layer', description: 'TCP, UDP, congestion control' },
      { week: 7, topic: 'Midterm Review & Exam', description: 'Review and examination' },
      { week: 8, topic: 'Application Layer', description: 'HTTP, DNS, SMTP, FTP' },
      { week: 9, topic: 'Network Security', description: 'Cryptography, firewalls, VPNs' },
      { week: 10, topic: 'Wireless Networks', description: 'WiFi, cellular networks, IoT' },
      { week: 11, topic: 'Network Programming', description: 'Socket programming, APIs' },
      { week: 12, topic: 'Cloud Networking', description: 'SDN, NFV, cloud architectures' },
      { week: 13, topic: 'Network Management', description: 'SNMP, monitoring, troubleshooting' },
      { week: 14, topic: 'Final Review', description: 'Comprehensive review' },
    ],
    assessmentBreakdown: [
      { type: 'Assignments', weightage: 15 },
      { type: 'Lab Projects', weightage: 20 },
      { type: 'Midterm Exam', weightage: 25 },
      { type: 'Final Exam', weightage: 30 },
      { type: 'Quizzes', weightage: 10 },
    ],
    textbooks: [
      { title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', type: 'required' },
      { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', type: 'reference' },
    ],
    officeHours: 'Wednesday & Friday, 1:00 PM - 3:00 PM',
    totalStudents: 41,
  },
};

// Default data for courses not in the hardcoded list
const defaultCourseData = {
  objectives: [
    'Understand fundamental concepts of the subject',
    'Apply theoretical knowledge to practical problems',
    'Develop critical thinking and problem-solving skills',
    'Gain hands-on experience through projects and labs'
  ],
  prerequisites: [],
  syllabus: [],
  assessmentBreakdown: [
    { type: 'Assignments', weightage: 20 },
    { type: 'Midterm Exam', weightage: 30 },
    { type: 'Final Exam', weightage: 40 },
    { type: 'Participation', weightage: 10 },
  ],
  textbooks: [],
  officeHours: 'Contact instructor for office hours',
};

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError('Course ID not provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // First check if we have hardcoded data for this course
      const hardcodedCourse = coursesData[courseId];
      if (hardcodedCourse) {
        setCourse(hardcodedCourse);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        const response = await coursesApi.getById(courseId);
        
        if (response.success && response.data) {
          const apiCourse = response.data;
          
          // Get faculty name
          const facultyName = typeof apiCourse.faculty === 'object' && apiCourse.faculty 
            ? apiCourse.faculty.name 
            : 'Not Assigned';

          // Get enrolled students count
          let totalStudents = 0;
          try {
            const studentsRes = await coursesApi.getStudents(courseId);
            if (studentsRes.success && studentsRes.data) {
              totalStudents = studentsRes.data.length;
            }
          } catch {
            totalStudents = 0;
          }

          // Map API data to CourseData format
          const mappedCourse: CourseData = {
            id: apiCourse._id,
            name: apiCourse.name,
            code: apiCourse.code,
            instructor: facultyName,
            instructorEmail: `${facultyName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
            credits: apiCourse.credits,
            schedule: `${apiCourse.lectureHours || 3} Lecture + ${apiCourse.tutorialHours || 1} Tutorial hours/week`,
            room: 'Check with department',
            progress: 0, // Will be updated if available
            description: apiCourse.description || `${apiCourse.name} is a ${apiCourse.credits}-credit course offered in semester ${apiCourse.semesterNumber}. This course covers essential concepts and practical applications in the field.`,
            objectives: defaultCourseData.objectives,
            prerequisites: defaultCourseData.prerequisites,
            syllabus: apiCourse.syllabus ? [{ week: 1, topic: 'Course Content', description: apiCourse.syllabus }] : defaultCourseData.syllabus,
            assessmentBreakdown: [
              { type: 'Internal Assessment', weightage: apiCourse.internalMarks || 40 },
              { type: 'External Exam', weightage: apiCourse.externalMarks || 60 },
            ],
            textbooks: defaultCourseData.textbooks,
            officeHours: defaultCourseData.officeHours,
            totalStudents: totalStudents,
          };

          setCourse(mappedCourse);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course details');
      }
      
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Course not found</h2>
          <button 
            onClick={() => navigate('/student/courses')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/student/courses')}
            className="p-2 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">{course.code}</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{course.credits} Credits</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">{course.name}</h1>
          </div>
        </div>

        {/* Course Banner */}
        <Card className="border-purple-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-purple-500 to-purple-600 p-6 flex items-end justify-between">
            <div>
              <p className="text-white/80 mb-2">Instructor</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{course.instructor}</h3>
                  <p className="text-white/70 text-sm">{course.instructorEmail}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Users className="w-4 h-4" />
                <span>{course.totalStudents} Students Enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{course.room}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Schedule</p>
                  <p className="font-medium text-gray-800">{course.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Office Hours</p>
                  <p className="font-medium text-gray-800">{course.officeHours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Your Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-purple-200 rounded-full w-24">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="font-medium text-purple-600">{course.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Description */}
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Course Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Objectives */}
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Learning Objectives
              </h3>
              <ul className="space-y-3">
                {course.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Prerequisites
              </h3>
              <ul className="space-y-3">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <BookMarked className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">{prereq}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Breakdown */}
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Assessment Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {course.assessmentBreakdown.map((assessment, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{assessment.weightage}%</p>
                  <p className="text-sm text-gray-600 mt-1">{assessment.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Syllabus */}
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Course Syllabus
            </h3>
            <div className="space-y-3">
              {course.syllabus.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                    index < Math.floor(course.progress / 7) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 hover:bg-purple-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index < Math.floor(course.progress / 7)
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {index < Math.floor(course.progress / 7) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{item.week}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{item.topic}</h4>
                      {index < Math.floor(course.progress / 7) && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Textbooks & References */}
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-purple-600" />
              Textbooks & References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.textbooks.map((book, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-12 h-16 rounded-lg flex items-center justify-center ${
                    book.type === 'required' ? 'bg-purple-500' : 'bg-gray-400'
                  }`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      book.type === 'required' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {book.type === 'required' ? 'Required' : 'Reference'}
                    </span>
                    <h4 className="font-medium text-gray-800 mt-1">{book.title}</h4>
                    <p className="text-sm text-gray-500">by {book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/student/attendance')}
            className="flex-1 min-w-[200px] py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            View Attendance
          </button>
          <button 
            onClick={() => navigate('/student/grades')}
            className="flex-1 min-w-[200px] py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            View Grades
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetails;
