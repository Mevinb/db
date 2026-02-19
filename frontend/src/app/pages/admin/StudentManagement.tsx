import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { studentsApi, departmentsApi, programsApi } from '@/app/services/api';
import type { Student, Department, Program } from '@/app/types';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    programId: '',
    semester: 1,
    enrollmentYear: new Date().getFullYear(),
    dob: '',
    address: '',
    password: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [studentsRes, deptsRes, progsRes] = await Promise.all([
      studentsApi.getAll(),
      departmentsApi.getAll(),
      programsApi.getAll(),
    ]);
    
    if (studentsRes.success) {
      setStudents(studentsRes.data || []);
      setFilteredStudents(studentsRes.data || []);
    }
    if (deptsRes.success) setDepartments(deptsRes.data || []);
    if (progsRes.success) setPrograms(progsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const getDepartmentName = (dept: any) => {
    if (typeof dept === 'object' && dept !== null) {
      return dept.name || 'Unknown';
    }
    return departments.find(d => d._id === dept)?.name || 'Unknown';
  };
  
  const getProgramName = (prog: any) => {
    if (typeof prog === 'object' && prog !== null) {
      return prog.name || 'Unknown';
    }
    return programs.find(p => p._id === prog)?.name || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transform formData to match backend expectations
      const apiData: any = {
        rollNumber: formData.rollNumber,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        programId: formData.programId,
        currentSemester: formData.semester,
        admissionYear: formData.enrollmentYear,
        dateOfBirth: formData.dob,
        address: formData.address,
      };
      
      // Include password if provided
      if (formData.password) {
        apiData.password = formData.password;
      }

      let response;
      if (editingStudent) {
        response = await studentsApi.update(editingStudent._id, apiData);
        if (response.success) {
          toast.success('Student updated successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to update student');
        }
      } else {
        response = await studentsApi.create(apiData);
        if (response.success) {
          toast.success('Student added successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to add student');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      const response = await studentsApi.delete(deletingStudent._id);
      if (response.success) {
        toast.success('Student deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete student');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteDialog(false);
      setDeletingStudent(null);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingStudent(null);
    setFormData({
      rollNumber: '',
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      programId: '',
      semester: 1,
      enrollmentYear: new Date().getFullYear(),
      dob: '',
      address: '',
      password: 'Student@123',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (student: Student) => {
    setEditingStudent(student);
    const deptId = typeof student.department === 'object' ? student.department._id : student.department;
    const progId = typeof student.program === 'object' ? student.program._id : student.program;
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      departmentId: deptId || '',
      programId: progId || '',
      semester: student.currentSemester || 1,
      enrollmentYear: student.admissionYear || new Date().getFullYear(),
      dob: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      address: student.address || '',
      password: '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingStudent(null);
  };

  return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Students
            </h1>
            <p className="text-gray-600 text-sm">Manage student records and information</p>
          </div>
          <Button onClick={handleOpenCreateDialog} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Students ({filteredStudents.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
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
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Roll Number</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Semester</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {student.rollNumber}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                        <TableCell className="text-gray-600">{student.email}</TableCell>
                        <TableCell className="text-gray-600">{getDepartmentName(student.department)}</TableCell>
                        <TableCell className="text-gray-600">{student.currentSemester}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(student)} className="hover:bg-purple-100 hover:text-purple-600 rounded-xl">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setDeletingStudent(student); setShowDeleteDialog(true); }} className="hover:bg-red-100 hover:text-red-600 rounded-xl">
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
          <DialogContent className="max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingStudent ? 'Update student information' : 'Fill in the student details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Roll Number *</Label>
                  <Input value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select value={formData.programId} onValueChange={(value) => setFormData({ ...formData, programId: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {programs.map((prog) => (
                        <SelectItem key={prog._id} value={prog._id}>{prog.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Input type="number" min="1" max="12" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Enrollment Year *</Label>
                  <Input type="number" value={formData.enrollmentYear} onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>{editingStudent ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingStudent} placeholder={editingStudent ? 'Leave blank to keep current' : 'Enter password'} className="border-gray-200 focus:border-purple-500" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-0 shadow-2xl bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete student <strong>"{deletingStudent?.name}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                Delete Student
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default StudentManagement;
