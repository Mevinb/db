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

// Default placeholder data for fields not stored in database
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
      
      // Fetch course from API (database)
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
