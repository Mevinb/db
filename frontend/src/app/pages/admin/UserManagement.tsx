import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
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
import { authApi } from '@/app/services/api';
import type { User } from '@/app/types';
import { Plus, Pencil, Trash2, Search, Shield, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface ExtendedUser extends User {
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filtered, setFiltered] = useState<ExtendedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editing, setEditing] = useState<ExtendedUser | null>(null);
  const [deleting, setDeleting] = useState<ExtendedUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as string,
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    const response = await authApi.getUsers();
    if (response.success) {
      setUsers((response.data as ExtendedUser[]) || []);
      setFiltered((response.data as ExtendedUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [searchQuery, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        const response = await authApi.updateUser(editing._id, updateData);
        if (response.success) {
          toast.success('User updated!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to update user');
        }
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        const response = await authApi.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        if (response.success) {
          toast.success('User created!');
          fetchData();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Failed to create user');
        }
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const response = await authApi.deleteUser(deleting._id);
      if (response.success) {
        toast.success('User deleted!');
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

  const handleToggleActive = async (user: ExtendedUser) => {
    try {
      const response = await authApi.updateUser(user._id, { isActive: !user.isActive } as any);
      if (response.success) {
        toast.success(user.isActive ? 'User deactivated' : 'User activated');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to update user');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData({ name: '', email: '', password: '', role: 'student', isActive: true });
    setShowDialog(true);
  };

  const handleOpenEdit = (user: ExtendedUser) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive !== false,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditing(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'faculty': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'student': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            User Management
          </h1>
          <p className="text-sm text-gray-600">Manage system users and their access</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md bg-white/80">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white/80">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white/80">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-500">Faculty</p>
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'faculty').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white/80">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-500">Students</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'student').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-100 pb-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">
              All Users ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
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
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-100">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Login</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive !== false}
                          onCheckedChange={() => handleToggleActive(user)}
                        />
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : <span className="text-gray-400 italic">Never</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user)}
                            className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleting(user); setShowDeleteDialog(true); }}
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
              {editing ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editing ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editing}
                    minLength={6}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-gray-700">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger className="border-gray-200 focus:border-purple-500">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                  <Label className="text-gray-700 text-sm">Active</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {editing ? 'Update' : 'Create'}
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
              This will permanently delete the user &quot;{deleting?.name}&quot; ({deleting?.email}). This action cannot be undone.
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

export default UserManagement;
