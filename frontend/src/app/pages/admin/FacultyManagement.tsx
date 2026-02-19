import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { facultyApi, departmentsApi } from '@/app/services/api';
import type { Faculty, Department } from '@/app/types';
import { Plus, Pencil, Trash2, Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const FacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    qualification: '',
    specialization: '',
    joiningDate: '',
    password: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [facultyRes, deptsRes] = await Promise.all([
      facultyApi.getAll(),
      departmentsApi.getAll(),
    ]);
    
    if (facultyRes.success) {
      setFaculty(facultyRes.data || []);
      setFilteredFaculty(facultyRes.data || []);
    }
    if (deptsRes.success) setDepartments(deptsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = faculty.filter(
      (fac) =>
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFaculty(filtered);
  }, [searchQuery, faculty]);

  const getDepartmentName = (dept: any) => {
    if (typeof dept === 'object' && dept !== null) {
      return dept.name || 'Unknown';
    }
    return departments.find(d => d._id === dept)?.name || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transform formData to match backend expectations
      const apiData: any = {
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        designation: formData.designation,
        qualification: formData.qualification,
        specialization: formData.specialization,
        dateOfJoining: formData.joiningDate,
      };
      
      // Include password if provided
      if (formData.password) {
        apiData.password = formData.password;
      }

      let response;
      if (editingFaculty) {
        response = await facultyApi.update(editingFaculty._id, apiData);
        if (response.success) {
          toast.success('Faculty updated successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to update faculty');
        }
      } else {
        response = await facultyApi.create(apiData);
        if (response.success) {
          toast.success('Faculty added successfully!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to add faculty');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    try {
      const response = await facultyApi.delete(deletingFaculty._id);
      if (response.success) {
        toast.success('Faculty deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete faculty');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteDialog(false);
      setDeletingFaculty(null);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingFaculty(null);
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      designation: '',
      qualification: '',
      specialization: '',
      joiningDate: '',
      password: 'Faculty@123',
    });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (fac: Faculty) => {
    setEditingFaculty(fac);
    const deptId = typeof fac.department === 'object' ? fac.department._id : fac.department;
    setFormData({
      employeeId: fac.employeeId,
      name: fac.name,
      email: fac.email,
      phone: fac.phone || '',
      departmentId: deptId || '',
      designation: fac.designation,
      qualification: fac.qualification,
      specialization: fac.specialization,
      joiningDate: fac.joiningDate ? fac.joiningDate.split('T')[0] : '',
      password: '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingFaculty(null);
  };

  return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Faculty
            </h1>
            <p className="text-sm text-gray-600">Manage faculty members and staff</p>
          </div>
          <Button onClick={handleOpenCreateDialog} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30">
            <Plus className="mr-2 h-4 w-4" />
            Add Faculty
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100 pb-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Faculty ({filteredFaculty.length})
              </CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
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
                <p className="mt-4 text-gray-600">Loading faculty...</p>
              </div>
            ) : filteredFaculty.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500">No faculty found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-100">
                      <TableHead className="font-semibold text-gray-700">Employee ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Designation</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.map((fac) => (
                      <TableRow key={fac._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                        <TableCell>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {fac.employeeId}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{fac.name}</TableCell>
                        <TableCell className="text-gray-600">{fac.email}</TableCell>
                        <TableCell className="text-gray-600">{getDepartmentName(fac.department)}</TableCell>
                        <TableCell className="text-gray-600">{fac.designation}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(fac)} className="hover:bg-purple-100 hover:text-purple-600 rounded-xl">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setDeletingFaculty(fac); setShowDeleteDialog(true); }} className="hover:bg-red-100 hover:text-red-600 rounded-xl">
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
                {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingFaculty ? 'Update faculty information' : 'Fill in the faculty details'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Employee ID *</Label>
                  <Input value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
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
                  <Label>Designation *</Label>
                  <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Professor">Professor</SelectItem>
                      <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                      <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                      <SelectItem value="Lecturer">Lecturer</SelectItem>
                      <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualification *</Label>
                  <Input value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Specialization *</Label>
                  <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date *</Label>
                  <Input type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} required className="border-gray-200 focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label>{editingFaculty ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingFaculty} placeholder={editingFaculty ? 'Leave blank to keep current' : 'Enter password'} className="border-gray-200 focus:border-purple-500" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
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
                This will permanently delete faculty member <strong>"{deletingFaculty?.name}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                Delete Faculty
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default FacultyManagement;
