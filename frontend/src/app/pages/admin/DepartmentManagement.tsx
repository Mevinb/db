import React, { useEffect, useState } from 'react';
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
import { departmentsApi, facultyApi } from '@/app/services/api';
import type { Department, Faculty } from '@/app/types';
import { Plus, Pencil, Trash2, Search, Building2, Filter, Users, BookOpen, UserCheck, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [departmentStats, setDepartmentStats] = useState<Record<string, { programs: number; faculty: number; students: number; courses: number }>>({});
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    headOfDepartment: '',
  });

  const fetchDepartments = async () => {
    setLoading(true);
    const [deptResponse, facultyResponse] = await Promise.all([
      departmentsApi.getAll(),
      facultyApi.getAll(),
    ]);
    if (deptResponse.success) {
      setDepartments(deptResponse.data || []);
      setFilteredDepartments(deptResponse.data || []);
      // Fetch stats for each department
      const depts = deptResponse.data || [];
      const statsPromises = depts.map(async (dept) => {
        const statsRes = await departmentsApi.getStats(dept._id);
        if (statsRes.success && statsRes.data) {
          return { id: dept._id, stats: statsRes.data };
        }
        return { id: dept._id, stats: { programs: 0, faculty: 0, students: 0, courses: 0 } };
      });
      const allStats = await Promise.all(statsPromises);
      const statsMap: Record<string, any> = {};
      allStats.forEach(({ id, stats }) => { statsMap[id] = stats; });
      setDepartmentStats(statsMap);
    }
    if (facultyResponse.success) {
      setFaculty(facultyResponse.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDepartments(filtered);
  }, [searchQuery, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (editingDepartment) {
        response = await departmentsApi.update(editingDepartment._id, formData);
        toast.success('Department updated successfully!');
      } else {
        response = await departmentsApi.create(formData);
        toast.success('Department created successfully!');
      }

      if (response.success) {
        fetchDepartments();
        handleCloseDialog();
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;

    try {
      const response = await departmentsApi.delete(deletingDepartment._id);
      if (response.success) {
        toast.success('Department deleted successfully!');
        fetchDepartments();
      } else {
        toast.error(response.error || 'Failed to delete department');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteDialog(false);
      setDeletingDepartment(null);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingDepartment(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      headOfDepartment: '',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (department: Department) => {
    setEditingDepartment(department);
    const hodId = typeof department.headOfDepartment === 'object' && department.headOfDepartment 
      ? department.headOfDepartment._id 
      : (department.headOfDepartment || '');
    setFormData({
      code: department.code,
      name: department.name,
      description: department.description,
      headOfDepartment: hodId,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingDepartment(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      headOfDepartment: '',
    });
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setDeletingDepartment(department);
    setShowDeleteDialog(true);
  };

  return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Departments
            </h1>
            <p className="text-sm text-gray-600">Manage all academic departments</p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Departments ({filteredDepartments.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search departments..."
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
                <p className="mt-4 text-gray-600">Loading departments...</p>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No departments found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Code</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">HOD</TableHead>
                      <TableHead className="font-semibold text-gray-700">Stats</TableHead>
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((department) => (
                      <TableRow 
                        key={department._id} 
                        className="border-purple-50 hover:bg-purple-50/50 transition-colors"
                      >
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {department.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {department.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {department.headOfDepartment && typeof department.headOfDepartment === 'object' 
                            ? department.headOfDepartment.name 
                            : <span className="text-gray-400 italic">Not assigned</span>
                          }
                        </TableCell>
                        <TableCell>
                          {departmentStats[department._id] ? (
                            <div className="flex gap-2 text-xs">
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded" title="Programs">
                                <BookOpen className="h-3 w-3" />{departmentStats[department._id].programs}
                              </span>
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded" title="Faculty">
                                <UserCheck className="h-3 w-3" />{departmentStats[department._id].faculty}
                              </span>
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded" title="Students">
                                <Users className="h-3 w-3" />{departmentStats[department._id].students}
                              </span>
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded" title="Courses">
                                <BookMarked className="h-3 w-3" />{departmentStats[department._id].courses}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Loading...</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-gray-600">
                          {department.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(department)}
                              className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(department)}
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
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingDepartment
                  ? 'Update department information'
                  : 'Fill in the details to create a new department'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-700">Department Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CSE"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    required
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Department Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Computer Science & Engineering"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headOfDepartment" className="text-gray-700">Head of Department</Label>
                  <Select 
                    value={formData.headOfDepartment} 
                    onValueChange={(value) => setFormData({ ...formData, headOfDepartment: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select HOD" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {faculty.map((fac) => (
                        <SelectItem key={fac._id} value={fac._id}>
                          {fac.name} ({fac.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the department"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-0 shadow-2xl bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                This will permanently delete the department <strong>"{deletingDepartment?.name}"</strong>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button 
                onClick={handleDelete} 
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Delete Department
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default DepartmentManagement;
