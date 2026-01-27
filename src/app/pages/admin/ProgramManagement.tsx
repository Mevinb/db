import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
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
import { programsApi, departmentsApi } from '@/app/services/api';
import type { Program, Department } from '@/app/types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
    department: '',
    duration: 4,
    degreeType: 'Bachelor' as 'Bachelor' | 'Master' | 'Doctorate' | 'Diploma' | 'Certificate',
    totalCredits: 160,
    totalSemesters: 8,
    description: '',
  });

  // Fetch programs and departments
  const fetchData = async () => {
    setLoading(true);
    const [programsRes, deptRes] = await Promise.all([
      programsApi.getAll(),
      departmentsApi.getAll(),
    ]);
    if (programsRes.success) {
      setPrograms(programsRes.data);
      setFilteredPrograms(programsRes.data);
    }
    if (deptRes.success) {
      setDepartments(deptRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = programs.filter(
      (prog) =>
        prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [searchQuery, programs]);

  // Get department name by ID
  const getDepartmentName = (dept: any) => {
    if (typeof dept === 'object' && dept?.name) return dept.name;
    const found = departments.find((d) => d._id === dept);
    return found?.name || 'Unknown';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingProgram) {
        response = await programsApi.update(editingProgram._id, formData);
        toast.success('Program updated successfully');
      } else {
        response = await programsApi.create(formData as any);
        toast.success('Program created successfully');
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

  // Handle delete
  const handleDelete = async () => {
    if (!deletingProgram) return;
    try {
      const response = await programsApi.delete(deletingProgram._id);
      if (response.success) {
        toast.success('Program deleted successfully');
        fetchData();
        setShowDeleteDialog(false);
        setDeletingProgram(null);
      } else {
        toast.error(response.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingProgram(null);
    setFormData({ code: '', name: '', department: '', duration: 4, degreeType: 'Bachelor', totalCredits: 160, totalSemesters: 8, description: '' });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (program: Program) => {
    setEditingProgram(program);
    const deptId = typeof program.department === 'object' ? program.department._id : program.department;
    setFormData({
      code: program.code,
      name: program.name,
      department: deptId,
      duration: program.duration,
      degreeType: program.degreeType,
      totalCredits: program.totalCredits,
      totalSemesters: program.totalSemesters,
      description: program.description || '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProgram(null);
    setFormData({ code: '', name: '', department: '', duration: 4, degreeType: 'Bachelor', totalCredits: 160, totalSemesters: 8, description: '' });
  };

  const handleOpenDeleteDialog = (program: Program) => {
    setDeletingProgram(program);
    setShowDeleteDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Program Management</h1>
            <p className="text-gray-500">Manage academic programs (B.Tech, M.Tech, etc.)</p>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">All Programs</CardTitle>
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
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No programs found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Duration (Years)</TableHead>
                      <TableHead>Total Credits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrograms.map((program) => (
                      <TableRow key={program._id}>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm font-medium">{program.code}</span>
                        </TableCell>
                        <TableCell>{program.name}</TableCell>
                        <TableCell>{getDepartmentName(program.department)}</TableCell>
                        <TableCell>{program.duration}</TableCell>
                        <TableCell>{program.totalCredits}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600" onClick={() => handleOpenEditDialog(program)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-500/20" onClick={() => handleOpenDeleteDialog(program)}>
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
              <DialogTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</DialogTitle>
              <DialogDescription>
                {editingProgram ? 'Update program details' : 'Fill in the details to create a new program'}
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
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bachelor of Technology in Computer Science"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
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
                  <Label htmlFor="degreeType">Degree Type *</Label>
                  <Select
                    value={formData.degreeType}
                    onValueChange={(value) => setFormData({ ...formData, degreeType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Years) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCredits">Total Credits *</Label>
                    <Input
                      id="totalCredits"
                      type="number"
                      min="1"
                      value={formData.totalCredits}
                      onChange={(e) => setFormData({ ...formData, totalCredits: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingProgram ? 'Update' : 'Create'}</Button>
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
                This will permanently delete the program "{deletingProgram?.name}". This action cannot be undone.
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

export default ProgramManagement;
