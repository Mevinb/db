import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { semestersApi } from '@/app/services/api';
import type { Semester } from '@/app/types';
import { Plus, Pencil, Trash2, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SemesterManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    semesterNumber: 1 as 1 | 2,
    startDate: '',
    endDate: '',
    status: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Completed',
    isCurrent: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const response = await semestersApi.getAll();
    if (response.success) {
      setSemesters(response.data || []);
      setFilteredSemesters(response.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = semesters.filter((semester) =>
      semester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      semester.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      semester.academicYear.includes(searchQuery)
    );
    setFilteredSemesters(filtered);
  }, [searchQuery, semesters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (editingSemester) {
        response = await semestersApi.update(editingSemester._id, formData);
        if (response.success) toast.success('Semester updated successfully!');
      } else {
        response = await semestersApi.create(formData);
        if (response.success) toast.success('Semester created successfully!');
      }

      if (response.success) {
        fetchData();
        handleCloseDialog();
      } else {
        toast.error(response.error || 'An error occurred');
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
        toast.success('Semester deleted successfully!');
        fetchData();
        setShowDeleteDialog(false);
        setDeletingSemester(null);
      } else {
        toast.error(response.error || 'An error occurred');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSetCurrent = async (semesterId: string) => {
    try {
      const response = await semestersApi.setCurrent(semesterId);
      if (response.success) {
        toast.success('Current semester updated!');
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
    setFormData({
      name: '',
      code: '',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semesterNumber: 1,
      startDate: '',
      endDate: '',
      status: 'Upcoming',
      isCurrent: false,
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
      startDate: semester.startDate.split('T')[0],
      endDate: semester.endDate.split('T')[0],
      status: semester.status,
      isCurrent: semester.isCurrent,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSemester(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Semesters
            </h1>
            <p className="text-sm text-gray-600">Manage academic semesters</p>
          </div>
          <Button
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Semesters ({filteredSemesters.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search semesters..."
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
                <p className="mt-4 text-gray-600">Loading semesters...</p>
              </div>
            ) : filteredSemesters.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No semesters found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Code</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Academic Year</TableHead>
                      <TableHead className="font-semibold text-gray-700">Semester</TableHead>
                      <TableHead className="font-semibold text-gray-700">Start Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">End Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSemesters.map((semester) => (
                      <TableRow key={semester._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{semester.code}</TableCell>
                        <TableCell className="text-gray-600">{semester.name}</TableCell>
                        <TableCell className="text-gray-600">{semester.academicYear}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {semester.semesterNumber === 1 ? 'Odd (1st)' : 'Even (2nd)'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(semester.startDate)}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(semester.endDate)}</TableCell>
                        <TableCell>
                          {semester.isCurrent ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          ) : (
                            <Badge className={
                              semester.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                              semester.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {semester.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(semester)}
                              className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingSemester(semester);
                                setShowDeleteDialog(true);
                              }}
                              className="hover:bg-red-100 hover:text-red-600 rounded-xl transition-all"
                              disabled={semester.isCurrent}
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
                {editingSemester ? 'Edit Semester' : 'Add New Semester'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingSemester ? 'Update semester information' : 'Fill in the details to create a new semester'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Semester Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Odd Semester 2024-25"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-gray-700">Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., SEM-ODD-2024"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear" className="text-gray-700">Academic Year *</Label>
                    <Input
                      id="academicYear"
                      placeholder="e.g., 2024-2025"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                      pattern="\d{4}-\d{4}"
                      title="Format: YYYY-YYYY (e.g., 2024-2025)"
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterNumber" className="text-gray-700">Semester Number *</Label>
                    <Select
                      value={formData.semesterNumber.toString()}
                      onValueChange={(value) => setFormData({ ...formData, semesterNumber: parseInt(value) as 1 | 2 })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="1">1 - Odd Semester</SelectItem>
                        <SelectItem value="2">2 - Even Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-700">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-700">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'Upcoming' | 'Ongoing' | 'Completed') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isCurrent: checked })}
                  />
                  <Label htmlFor="isCurrent" className="text-gray-700">Set as current semester</Label>
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
                  {editingSemester ? 'Update' : 'Create'}
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
                This will permanently delete the semester "{deletingSemester?.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingSemester(null)}>Cancel</AlertDialogCancel>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default SemesterManagement;
