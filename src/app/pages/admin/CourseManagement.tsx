import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { coursesApi, departmentsApi, programsApi, semestersApi } from '@/app/services/api';
import type { Course, Department, Program, Semester } from '@/app/types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    department: '',
    program: '',
    semester: '',
    semesterNumber: 1,
    type: 'Core' as 'Core' | 'Elective' | 'Lab' | 'Project' | 'Seminar',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [coursesRes, deptRes, progRes, semRes] = await Promise.all([
      coursesApi.getAll(),
      departmentsApi.getAll(),
      programsApi.getAll(),
      semestersApi.getAll(),
    ]);
    if (coursesRes.success) {
      setCourses(coursesRes.data);
      setFilteredCourses(coursesRes.data);
    }
    if (deptRes.success) {
      setDepartments(deptRes.data);
    }
    if (progRes.success) {
      setPrograms(progRes.data);
    }
    if (semRes.success) {
      setSemesters(semRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const getDepartmentName = (dept: { _id: string; name: string; code: string } | string | undefined) => {
    if (!dept) return 'Unknown';
    if (typeof dept === 'string') {
      const found = departments.find((d) => d._id === dept);
      return found?.name || 'Unknown';
    }
    return dept.name || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingCourse) {
        response = await coursesApi.update(editingCourse._id, formData);
        toast.success('Course updated successfully');
      } else {
        response = await coursesApi.create(formData as any);
        toast.success('Course created successfully');
      }
      if (response.success) {
        fetchData();
        handleCloseDialog();
      } else {
        toast.error(response.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      const response = await coursesApi.delete(deletingCourse._id);
      if (response.success) {
        toast.success('Course deleted successfully');
        fetchData();
        setShowDeleteDialog(false);
        setDeletingCourse(null);
      } else {
        toast.error(response.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      credits: 3,
      department: '',
      program: '',
      semester: '',
      semesterNumber: 1,
      type: 'Core',
      description: '',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (course: Course) => {
    setEditingCourse(course);
    const deptId = typeof course.department === 'string' ? course.department : course.department?._id || '';
    const progId = typeof course.program === 'string' ? course.program : course.program?._id || '';
    const semId = typeof course.semester === 'string' ? course.semester : course.semester?._id || '';
    setFormData({
      code: course.code,
      name: course.name,
      credits: course.credits,
      department: deptId,
      program: progId,
      semester: semId,
      semesterNumber: course.semesterNumber || 1,
      type: (course.type as 'Core' | 'Elective' | 'Lab' | 'Project' | 'Seminar') || 'Core',
      description: course.description || '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCourse(null);
  };

  const handleOpenDeleteDialog = (course: Course) => {
    setDeletingCourse(course);
    setShowDeleteDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
            <p className="text-gray-500">Manage courses offered</p>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">All Courses</CardTitle>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No courses found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm font-medium">{course.code}</span>
                        </TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{getDepartmentName(course.department)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            course.type === 'Core' ? 'bg-blue-100 text-blue-600' :
                            course.type === 'Elective' ? 'bg-green-100 text-green-600' :
                            course.type === 'Lab' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {course.type || 'Core'}
                          </span>
                        </TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>Sem {course.semesterNumber || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600" onClick={() => handleOpenEditDialog(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-500/20" onClick={() => handleOpenDeleteDialog(course)}>
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update course details' : 'Fill in the details to create a new course'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., CS101"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Introduction to Programming"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value, program: '', semester: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select
                      value={formData.program}
                      onValueChange={(value) => setFormData({ ...formData, program: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs
                          .filter((p) => {
                            const deptId = typeof p.department === 'string' ? p.department : p.department?._id;
                            return deptId === formData.department;
                          })
                          .map((prog) => (
                            <SelectItem key={prog._id} value={prog._id}>
                              {prog.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Academic Semester *</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem._id} value={sem._id}>
                            {sem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterNumber">Semester # *</Label>
                    <Select
                      value={formData.semesterNumber.toString()}
                      onValueChange={(value) => setFormData({ ...formData, semesterNumber: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Sem {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Elective">Elective</SelectItem>
                        <SelectItem value="Lab">Lab</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the course"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingCourse ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete course "{deletingCourse?.name}" ({deletingCourse?.code}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;
