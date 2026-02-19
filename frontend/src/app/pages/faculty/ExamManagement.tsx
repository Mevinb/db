import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { examsApi, coursesApi, semestersApi } from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { Plus, Pencil, Trash2, Search, FileText, Calendar, Award, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface Semester {
  _id: string;
  name: string;
  academicYear: string;
  isActive?: boolean;
}

interface Exam {
  _id: string;
  name: string;
  course: Course | string;
  semester: Semester | string;
  type: string;
  category: string;
  maxMarks: number;
  passingMarks: number;
  weightage?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  venue?: string;
  instructions?: string;
  status: string;
  isPublished: boolean;
}

const EXAM_TYPES = ['Quiz', 'Assignment', 'Mid-Term', 'End-Term', 'Lab', 'Project', 'Viva', 'Practical'];
const EXAM_CATEGORIES = ['Internal', 'External'];
const EXAM_STATUSES = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

const ExamManagement: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    semester: '',
    type: 'Quiz',
    category: 'Internal',
    maxMarks: 100,
    passingMarks: 40,
    weightage: 0,
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    venue: '',
    instructions: '',
    status: 'Scheduled',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch faculty's courses and all semesters
      const [coursesRes, semestersRes] = await Promise.all([
        coursesApi.getAll(),
        semestersApi.getAll(),
      ]);

      let facultyCourses: Course[] = [];
      if (coursesRes.success && coursesRes.data) {
        // Filter courses assigned to this faculty
        facultyCourses = coursesRes.data.filter((c: any) => {
          const courseFacultyId = c.faculty?._id || c.facultyId || c.faculty;
          return courseFacultyId == user?.profileId || courseFacultyId == user?._id;
        });
        setCourses(facultyCourses);
      }

      if (semestersRes.success) {
        setSemesters(semestersRes.data || []);
      }

      // Fetch exams for faculty's courses
      const allExams: Exam[] = [];
      for (const course of facultyCourses) {
        const examsRes = await examsApi.getByCourse(course._id);
        if (examsRes.success && examsRes.data) {
          allExams.push(...(examsRes.data as unknown as Exam[]));
        }
      }
      setExams(allExams);
      setFilteredExams(allExams);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = exams;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (exam) =>
          exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof exam.course === 'object' && exam.course.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by course
    if (filterCourse !== 'all') {
      filtered = filtered.filter((exam) => {
        const courseId = typeof exam.course === 'object' ? exam.course._id : exam.course;
        return courseId === filterCourse;
      });
    }

    setFilteredExams(filtered);
  }, [searchQuery, filterCourse, exams]);

  const handleOpenDialog = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      const courseId = typeof exam.course === 'object' ? exam.course._id : exam.course;
      const semesterId = typeof exam.semester === 'object' ? exam.semester._id : exam.semester;
      setFormData({
        name: exam.name,
        course: courseId,
        semester: semesterId,
        type: exam.type,
        category: exam.category,
        maxMarks: exam.maxMarks,
        passingMarks: exam.passingMarks,
        weightage: exam.weightage || 0,
        date: exam.date ? exam.date.split('T')[0] : '',
        startTime: exam.startTime || '',
        endTime: exam.endTime || '',
        duration: exam.duration || 60,
        venue: exam.venue || '',
        instructions: exam.instructions || '',
        status: exam.status,
      });
    } else {
      setEditingExam(null);
      // Set default semester to active one
      const activeSemester = semesters.find(s => s.isActive);
      setFormData({
        name: '',
        course: courses[0]?._id || '',
        semester: activeSemester?._id || semesters[0]?._id || '',
        type: 'Quiz',
        category: 'Internal',
        maxMarks: 100,
        passingMarks: 40,
        weightage: 0,
        date: '',
        startTime: '',
        endTime: '',
        duration: 60,
        venue: '',
        instructions: '',
        status: 'Scheduled',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingExam(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.course || !formData.semester) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.passingMarks > formData.maxMarks) {
      toast.error('Passing marks cannot exceed maximum marks');
      return;
    }

    try {
      const apiData = {
        name: formData.name,
        courseId: formData.course,
        semesterId: formData.semester,
        type: formData.type,
        category: formData.category,
        maxMarks: formData.maxMarks,
        passingMarks: formData.passingMarks,
        weightage: formData.weightage || undefined,
        date: formData.date || undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        duration: formData.duration || undefined,
        venue: formData.venue || undefined,
        instructions: formData.instructions || undefined,
        status: formData.status,
      };

      let response;
      if (editingExam) {
        response = await examsApi.update(editingExam._id, apiData as any);
        if (response.success) {
          toast.success('Exam updated successfully!');
        } else {
          toast.error(response.error || 'Failed to update exam');
          return;
        }
      } else {
        response = await examsApi.create(apiData as any);
        if (response.success) {
          toast.success('Exam created successfully!');
        } else {
          toast.error(response.error || 'Failed to create exam');
          return;
        }
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('An error occurred');
    }
  };

  const handleDeleteClick = (exam: Exam) => {
    setDeletingExam(exam);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExam) return;

    try {
      const response = await examsApi.delete(deletingExam._id);
      if (response.success) {
        toast.success('Exam deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('An error occurred');
    }
    setShowDeleteDialog(false);
    setDeletingExam(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Quiz': return 'bg-purple-100 text-purple-800';
      case 'Assignment': return 'bg-indigo-100 text-indigo-800';
      case 'Mid-Term': return 'bg-orange-100 text-orange-800';
      case 'End-Term': return 'bg-red-100 text-red-800';
      case 'Lab': return 'bg-cyan-100 text-cyan-800';
      case 'Project': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const totalExams = exams.length;
  const scheduledExams = exams.filter(e => e.status === 'Scheduled').length;
  const completedExams = exams.filter(e => e.status === 'Completed').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Exam Management</h1>
          <p className="text-slate-600 mt-1">Create and manage exams for your courses</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Exams</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalExams}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Scheduled</p>
            <h3 className="text-2xl font-bold text-slate-800">{scheduledExams}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Completed</p>
            <h3 className="text-2xl font-bold text-slate-800">{completedExams}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">My Courses</p>
            <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exams ({filteredExams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No exams found</h3>
              <p className="mt-2 text-gray-500">
                {courses.length === 0
                  ? "You don't have any courses assigned yet."
                  : "Click 'Create Exam' to add your first exam."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => {
                    const course = typeof exam.course === 'object' ? exam.course : null;
                    return (
                      <TableRow key={exam._id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>
                          {course ? `${course.code} - ${course.name}` : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                        </TableCell>
                        <TableCell>{exam.maxMarks}</TableCell>
                        <TableCell>
                          {exam.date
                            ? new Date(exam.date).toLocaleDateString()
                            : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(exam)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(exam)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
            <DialogDescription>
              {editingExam
                ? 'Update the exam details below.'
                : 'Fill in the details to create a new exam.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Exam Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mid-Term Examination"
                  required
                />
              </div>

              <div>
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester._id} value={semester._id}>
                        {semester.name} ({semester.academicYear})
                        {semester.isActive && ' - Active'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxMarks">Maximum Marks *</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min="1"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="passingMarks">Passing Marks *</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  min="0"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="weightage">Weightage (%)</Label>
                <Input
                  id="weightage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weightage}
                  onChange={(e) => setFormData({ ...formData, weightage: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Room 101"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter any special instructions for this exam..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingExam ? 'Update Exam' : 'Create Exam'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingExam?.name}"? This action cannot be undone.
              All marks associated with this exam will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamManagement;
