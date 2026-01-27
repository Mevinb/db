import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
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
import { semestersApi } from '@/app/services/api';
import type { Semester } from '@/app/types';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '',
    semesterNumber: 1 as 1 | 2,
    startDate: '',
    endDate: '',
    status: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Completed',
  });

  const fetchData = async () => {
    setLoading(true);
    const response = await semestersApi.getAll();
    if (response.success) {
      setSemesters(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert dates to ISO format for backend validation
      const submitData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
      };
      let response;
      if (editingSemester) {
        response = await semestersApi.update(editingSemester._id, submitData);
        toast.success('Semester updated successfully');
      } else {
        response = await semestersApi.create(submitData as any);
        toast.success('Semester created successfully');
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
    if (!deletingSemester) return;
    try {
      const response = await semestersApi.delete(deletingSemester._id);
      if (response.success) {
        toast.success('Semester deleted successfully');
        fetchData();
        setShowDeleteDialog(false);
        setDeletingSemester(null);
      } else {
        toast.error(response.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSetCurrent = async (semester: Semester) => {
    try {
      const response = await semestersApi.setCurrent(semester._id);
      if (response.success) {
        toast.success(`${semester.name} is now the current semester`);
        fetchData();
      } else {
        toast.error(response.error || 'Failed to set current semester');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingSemester(null);
    const currentYear = new Date().getFullYear();
    setFormData({
      name: '',
      code: '',
      academicYear: `${currentYear}-${currentYear + 1}`,
      semesterNumber: 1,
      startDate: '',
      endDate: '',
      status: 'Upcoming',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      code: semester.code,
      academicYear: semester.academicYear,
      semesterNumber: semester.semesterNumber,
      startDate: semester.startDate?.split('T')[0] || '',
      endDate: semester.endDate?.split('T')[0] || '',
      status: semester.status,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSemester(null);
  };

  const handleOpenDeleteDialog = (semester: Semester) => {
    setDeletingSemester(semester);
    setShowDeleteDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Semester Management</h1>
            <p className="text-gray-500">Manage academic semesters</p>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">All Semesters</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : semesters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No semesters found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesters.map((semester) => (
                      <TableRow key={semester._id}>
                        <TableCell className="font-medium">{semester.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{semester.code}</Badge>
                        </TableCell>
                        <TableCell>{semester.academicYear}</TableCell>
                        <TableCell>{new Date(semester.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(semester.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {semester.isCurrent ? (
                            <Badge className="bg-green-100 text-green-700">Current</Badge>
                          ) : (
                            <Badge variant="secondary">{semester.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!semester.isCurrent && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSetCurrent(semester)}
                                title="Set as current semester"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600" onClick={() => handleOpenEditDialog(semester)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-500/20" onClick={() => handleOpenDeleteDialog(semester)}>
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
              <DialogTitle>{editingSemester ? 'Edit Semester' : 'Add New Semester'}</DialogTitle>
              <DialogDescription>
                {editingSemester ? 'Update semester details' : 'Fill in the details to create a new semester'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Semester Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fall 2025-26"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., FALL2025"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year *</Label>
                    <Input
                      id="academicYear"
                      placeholder="e.g., 2025-2026"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      pattern="\d{4}-\d{4}"
                      title="Format: YYYY-YYYY (e.g., 2025-2026)"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semesterNumber">Semester Number *</Label>
                    <Select
                      value={String(formData.semesterNumber)}
                      onValueChange={(value) => setFormData({ ...formData, semesterNumber: parseInt(value) as 1 | 2 })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Fall/Odd)</SelectItem>
                        <SelectItem value="2">2 (Spring/Even)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as 'Upcoming' | 'Ongoing' | 'Completed' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingSemester ? 'Update' : 'Create'}</Button>
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
                This will permanently delete semester "{deletingSemester?.name}". This action cannot be undone.
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

export default SemesterManagement;
