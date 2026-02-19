import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { enrollmentsApi, studentsApi, coursesApi, semestersApi } from '@/app/services/api';
import type { Enrollment, Student, Course, Semester } from '@/app/types';
import { Plus, Pencil, Trash2, Search, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const EnrollmentManagement: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filtered, setFiltered] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editing, setEditing] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    semesterId: '',
    status: 'Enrolled',
  });

  const fetchData = async () => {
    setLoading(true);
    const [enrollRes, stuRes, crsRes, semRes] = await Promise.all([
      enrollmentsApi.getAll(),
      studentsApi.getAll(),
      coursesApi.getAll(),
      semestersApi.getAll(),
    ]);

    if (enrollRes.success) {
      setEnrollments(enrollRes.data || []);
      setFiltered(enrollRes.data || []);
    }
    if (stuRes.success) setStudents(stuRes.data || []);
    if (crsRes.success) setCourses(crsRes.data || []);
    if (semRes.success) setSemesters(semRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const result = enrollments.filter((e) => {
      const studentName = (e as any).student?.name || getStudentName(e.studentId);
      const courseName = (e as any).course?.name || getCourseName(e.courseId);
      return (
        studentName.toLowerCase().includes(q) ||
        courseName.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q)
      );
    });
    setFiltered(result);
  }, [searchQuery, enrollments]);

  const getStudentName = (id: string) => {
    const s = students.find((s) => s._id === id || String(s.id) === id);
    return s ? `${s.name} (${s.rollNumber})` : id;
  };

  const getCourseName = (id: string) => {
    const c = courses.find((c) => c._id === id || String(c.id) === id);
    return c ? `${c.code} - ${c.name}` : id;
  };

  const getSemesterName = (id: string) => {
    const s = semesters.find((s) => s._id === id || String(s.id) === id);
    return s ? s.name : id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await enrollmentsApi.update(editing._id, { status: formData.status } as any);
        if (response.success) toast.success('Enrollment updated!');
      } else {
        response = await enrollmentsApi.create(formData as any);
        if (response.success) toast.success('Student enrolled!');
      }
      if (response.success) {
        fetchData();
        handleCloseDialog();
      } else {
        toast.error(response.error || 'An error occurred');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const response = await enrollmentsApi.delete(deleting._id);
      if (response.success) {
        toast.success('Enrollment removed!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setShowDeleteDialog(false);
      setDeleting(null);
    }
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData({ studentId: '', courseId: '', semesterId: '', status: 'Enrolled' });
    setShowDialog(true);
  };

  const handleOpenEdit = (enrollment: Enrollment) => {
    setEditing(enrollment);
    setFormData({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      semesterId: enrollment.semesterId,
      status: enrollment.status || 'Enrolled',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditing(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enrolled': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'dropped': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Enrollments
          </h1>
          <p className="text-sm text-gray-600">Manage student course enrollments</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-100 pb-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">
              All Enrollments ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search enrollments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading enrollments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-gray-500">No enrollments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-100">
                    <TableHead className="font-semibold text-gray-700">Student</TableHead>
                    <TableHead className="font-semibold text-gray-700">Course</TableHead>
                    <TableHead className="font-semibold text-gray-700">Semester</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Enrolled On</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((enrollment) => {
                    const studentDisplay = (enrollment as any).student?.name
                      ? `${(enrollment as any).student.name} (${(enrollment as any).student.rollNumber || ''})`
                      : getStudentName(enrollment.studentId);
                    const courseDisplay = (enrollment as any).course?.name
                      ? `${(enrollment as any).course.code} - ${(enrollment as any).course.name}`
                      : getCourseName(enrollment.courseId);
                    const semesterDisplay = (enrollment as any).semester?.name
                      || getSemesterName(enrollment.semesterId);
                    return (
                      <TableRow key={enrollment._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{studentDisplay}</TableCell>
                        <TableCell className="text-gray-700">{courseDisplay}</TableCell>
                        <TableCell className="text-gray-600">{semesterDisplay}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {new Date(enrollment.enrollmentDate || enrollment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(enrollment)}
                              className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setDeleting(enrollment); setShowDeleteDialog(true); }}
                              className="hover:bg-red-100 hover:text-red-600 rounded-xl transition-all"
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
        <DialogContent className="max-w-md border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {editing ? 'Edit Enrollment' : 'Enroll Student'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editing ? 'Update enrollment status' : 'Enroll a student in a course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {!editing && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Student *</Label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(v) => setFormData({ ...formData, studentId: v })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60">
                        {students.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.rollNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Course *</Label>
                    <Select
                      value={formData.courseId}
                      onValueChange={(v) => setFormData({ ...formData, courseId: v })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60">
                        {courses.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Semester *</Label>
                    <Select
                      value={formData.semesterId}
                      onValueChange={(v) => setFormData({ ...formData, semesterId: v })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-60">
                        {semesters.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-gray-700">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="border-gray-200 focus:border-purple-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {editing ? 'Update' : 'Enroll'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this enrollment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleting(null)}>Cancel</AlertDialogCancel>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnrollmentManagement;
