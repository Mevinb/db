import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
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
import { programsApi, departmentsApi } from '@/app/services/api';
import type { Program, Department } from '@/app/types';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const ProgramManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    duration: 4,
    totalCredits: 160,
    degreeType: 'Bachelor',
    totalSemesters: 8,
  });

  const fetchData = async () => {
    setLoading(true);
    const [programsRes, deptsRes] = await Promise.all([
      programsApi.getAll(),
      departmentsApi.getAll(),
    ]);
    
    if (programsRes.success) {
      setPrograms(programsRes.data || []);
      setFilteredPrograms(programsRes.data || []);
    }
    if (deptsRes.success) {
      setDepartments(deptsRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = programs.filter(
      (prog) =>
        prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [searchQuery, programs]);

  const getDepartmentName = (dept: any) => {
    if (typeof dept === 'object' && dept !== null) {
      return dept.name || 'Unknown';
    }
    const found = departments.find(d => d._id === dept);
    return found?.name || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Transform formData to match backend expectations
      const apiData = {
        code: formData.code,
        name: formData.name,
        departmentId: formData.departmentId,
        duration: formData.duration,
        totalCredits: formData.totalCredits,
        degreeType: formData.degreeType,
        totalSemesters: formData.totalSemesters,
      };

      let response;
      if (editingProgram) {
        response = await programsApi.update(editingProgram._id, apiData);
        if (response.success) {
          toast.success('Program updated successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to update program');
        }
      } else {
        response = await programsApi.create(apiData as any);
        if (response.success) {
          toast.success('Program created successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to create program');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;

    try {
      const response = await programsApi.delete(deletingProgram._id);
      if (response.success) {
        toast.success('Program deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete program');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteDialog(false);
      setDeletingProgram(null);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingProgram(null);
    setFormData({
      code: '',
      name: '',
      departmentId: '',
      duration: 4,
      totalCredits: 160,
      degreeType: 'Bachelor',
      totalSemesters: 8,
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    setEditingProgram(program);
    const deptId = typeof program.department === 'object' ? program.department._id : program.department;
    setFormData({
      code: program.code,
      name: program.name,
      departmentId: deptId || '',
      duration: program.duration,
      totalCredits: program.totalCredits,
      degreeType: program.degreeType || 'Bachelor',
      totalSemesters: program.totalSemesters || 8,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProgram(null);
  };

  return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Programs
            </h1>
            <p className="text-sm text-gray-600">Manage academic programs and degrees</p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Programs ({filteredPrograms.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search programs..."
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
                <p className="mt-4 text-gray-600">Loading programs...</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No programs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Code</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                      <TableHead className="font-semibold text-gray-700">Credits</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrograms.map((program) => (
                      <TableRow 
                        key={program._id}
                        className="border-purple-50 hover:bg-purple-50/50 transition-colors"
                      >
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {program.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {program.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {getDepartmentName(program.department)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {program.duration} years
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {program.totalCredits}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(program)}
                              className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingProgram(program);
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
                {editingProgram ? 'Edit Program' : 'Add New Program'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingProgram ? 'Update program information' : 'Fill in the details to create a new program'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Program Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., BTECH-CSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="border-gray-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., B.Tech in Computer Science"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-gray-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
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
                  <Label htmlFor="degreeType">Degree Type *</Label>
                  <Select
                    value={formData.degreeType}
                    onValueChange={(value) => setFormData({ ...formData, degreeType: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (years) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                      className="border-gray-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalSemesters">Total Semesters *</Label>
                    <Input
                      id="totalSemesters"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.totalSemesters}
                      onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value) })}
                      required
                      className="border-gray-200 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Total Credits *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={formData.totalCredits}
                    onChange={(e) => setFormData({ ...formData, totalCredits: parseInt(e.target.value) })}
                    required
                    className="border-gray-200 focus:border-purple-500"
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
                  {editingProgram ? 'Update Program' : 'Create Program'}
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
              <AlertDialogDescription className="text-gray-600">
                This will permanently delete the program <strong>"{deletingProgram?.name}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Delete Program
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default ProgramManagement;
