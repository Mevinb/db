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
import { coursesApi, departmentsApi, programsApi, semestersApi, facultyApi } from '@/app/services/api';
import type { Course, Department, Program, Semester, Faculty } from '@/app/types';
import { Plus, Pencil, Trash2, Search, BookOpen, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
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
    departmentId: '',
    programId: '',
    semesterId: '',
    semesterNumber: 1,
    type: 'Core',
    description: '',
    facultyId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [coursesRes, deptsRes, progsRes, semsRes, facRes] = await Promise.all([
      coursesApi.getAll(),
      departmentsApi.getAll(),
      programsApi.getAll(),
      semestersApi.getAll(),
      facultyApi.getAll(),
    ]);

    if (coursesRes.success) {
      setCourses(coursesRes.data || []);
      setFilteredCourses(coursesRes.data || []);
    }
    if (deptsRes.success) setDepartments(deptsRes.data || []);
    if (progsRes.success) setPrograms(progsRes.data || []);
    if (semsRes.success) setSemesters(semsRes.data || []);
    if (facRes.success) setFacultyList(facRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Transform formData to match backend expectations
      const apiData = {
        code: formData.code,
        name: formData.name,
        credits: formData.credits,
        departmentId: formData.departmentId,
        programId: formData.programId,
        semesterId: formData.semesterId,
        semesterNumber: formData.semesterNumber,
        type: formData.type,
        description: formData.description,
        ...(formData.facultyId ? { facultyId: formData.facultyId } : {}),
      };

      let response;
      if (editingCourse) {
        response = await coursesApi.update(editingCourse._id, apiData);
        if (response.success) {
          toast.success('Course updated successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to update course');
        }
      } else {
        response = await coursesApi.create(apiData as any);
        if (response.success) {
          toast.success('Course created successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to create course');
        }
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
        toast.success('Course deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete course');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteDialog(false);
      setDeletingCourse(null);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      credits: 3,
      departmentId: '',
      programId: '',
      semesterId: '',
      semesterNumber: 1,
      type: 'Core',
      description: '',
      facultyId: '',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (course: Course) => {
    setEditingCourse(course);
    const deptId = typeof course.department === 'object' ? course.department._id : course.department;
    const progId = typeof course.program === 'object' ? course.program?._id : course.program;
    const semId = typeof course.semester === 'object' ? course.semester?._id : '';
    const facId = typeof course.faculty === 'object' ? course.faculty?._id : course.faculty;
    setFormData({
      code: course.code,
      name: course.name,
      credits: course.credits,
      departmentId: deptId || '',
      programId: progId || '',
      semesterId: semId || '',
      semesterNumber: course.semesterNumber || 1,
      type: course.type || 'Core',
      description: course.description || '',
      facultyId: facId || '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCourse(null);
  };

  const getDepartmentName = (department: any) => {
    if (typeof department === 'object' && department !== null) {
      return department.name || 'Unknown';
    }
    const dept = departments.find((d) => d._id === department);
    return dept?.name || 'Unknown';
  };

  const getSemesterDisplay = (semester: any, semesterNumber?: number) => {
    if (typeof semester === 'object' && semester !== null) {
      return semester.name || `Sem ${semesterNumber || ''}`;
    }
    return `Semester ${semester}`;
  };

  return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Courses
            </h1>
            <p className="text-sm text-gray-600">Manage all academic courses</p>
          </div>
          <Button
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Courses ({filteredCourses.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
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
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No courses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Code</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Credits</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Semester</TableHead>
                      <TableHead className="font-semibold text-gray-700">Faculty</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {course.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{course.name}</TableCell>
                        <TableCell className="text-gray-600">{course.credits}</TableCell>
                        <TableCell className="text-gray-600">{getDepartmentName(course.department)}</TableCell>
                        <TableCell className="text-gray-600">{getSemesterDisplay(course.semester, course.semesterNumber)}</TableCell>
                        <TableCell className="text-gray-600">
                          {typeof course.faculty === 'object' && course.faculty
                            ? course.faculty.name
                            : course.faculty
                              ? facultyList.find(f => f._id === course.faculty)?.name || '—'
                              : <span className="text-gray-400 italic">Unassigned</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(course)}
                              className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingCourse(course);
                                setShowDeleteDialog(true);
                              }}
                              className="hover:bg-red-100 hover:text-red-600 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
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
          <DialogContent className="max-w-md border-0 shadow-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingCourse ? 'Update course information' : 'Fill in the details to create a new course'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-700">Course Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CS101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Course Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Introduction to Computing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits" className="text-gray-700">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterNumber" className="text-gray-700">Semester Number *</Label>
                    <Input
                      id="semesterNumber"
                      type="number"
                      min={1}
                      max={12}
                      value={formData.semesterNumber}
                      onChange={(e) => setFormData({ ...formData, semesterNumber: parseInt(e.target.value) || 1 })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700">Course Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Core">Core</SelectItem>
                      <SelectItem value="Elective">Elective</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-gray-700">Department *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programId" className="text-gray-700">Program *</Label>
                  <Select
                    value={formData.programId}
                    onValueChange={(value) => setFormData({ ...formData, programId: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {programs.map((prog) => (
                        <SelectItem key={prog._id} value={prog._id}>
                          {prog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semesterId" className="text-gray-700">Academic Semester *</Label>
                  <Select
                    value={formData.semesterId}
                    onValueChange={(value) => setFormData({ ...formData, semesterId: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select academic semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {semesters.map((sem) => (
                        <SelectItem key={sem._id} value={sem._id}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultyId" className="text-gray-700">Assigned Faculty</Label>
                  <Select
                    value={formData.facultyId}
                    onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select faculty (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                      <SelectItem value="none">No Faculty</SelectItem>
                      {facultyList.map((fac) => (
                        <SelectItem key={fac._id} value={fac._id}>
                          {fac.name} ({fac.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Course description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the course "{deletingCourse?.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCourse(null)}>Cancel</AlertDialogCancel>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default CourseManagement;
