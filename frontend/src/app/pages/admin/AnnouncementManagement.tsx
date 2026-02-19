import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
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
import { announcementsApi } from '@/app/services/api';
import type { Announcement } from '@/app/types';
import { Plus, Pencil, Trash2, Search, Megaphone, Pin, PinOff } from 'lucide-react';
import { toast } from 'sonner';

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    isActive: true,
    isPinned: false,
    expiryDate: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const response = await announcementsApi.getAll();
    if (response.success) {
      setAnnouncements(response.data || []);
      setFiltered(response.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const result = announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [searchQuery, announcements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate || undefined,
      };
      let response;
      if (editing) {
        response = await announcementsApi.update(editing._id, payload);
        if (response.success) toast.success('Announcement updated!');
      } else {
        response = await announcementsApi.create(payload);
        if (response.success) toast.success('Announcement created!');
      }
      if (response.success) {
        fetchData();
        handleCloseDialog();
      } else {
        toast.error(response.error || 'An error occurred');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const response = await announcementsApi.delete(deleting._id);
      if (response.success) {
        toast.success('Announcement deleted!');
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

  const handleTogglePin = async (ann: Announcement) => {
    try {
      const response = await announcementsApi.togglePin(ann._id);
      if (response.success) {
        toast.success(ann.isPinned ? 'Unpinned' : 'Pinned');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to toggle pin');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Normal',
      isActive: true,
      isPinned: false,
      expiryDate: '',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditing(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category || 'General',
      priority: ann.priority || 'Normal',
      isActive: ann.isActive !== false,
      isPinned: ann.isPinned || false,
      expiryDate: ann.expiryDate ? ann.expiryDate.split('T')[0] : '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditing(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Announcements
          </h1>
          <p className="text-sm text-gray-600">Create and manage announcements for students & faculty</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-100 pb-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">
              All Announcements ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search announcements..."
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
              <p className="mt-4 text-gray-600">Loading announcements...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-gray-500">No announcements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-100">
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((ann) => (
                    <TableRow key={ann._id} className="border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ann.isPinned && <Pin className="h-3.5 w-3.5 text-purple-500" />}
                          <span className="font-medium text-gray-900 max-w-[250px] truncate">{ann.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ann.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ann.priority)}`}>
                          {ann.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ann.isActive !== false ? 'default' : 'secondary'} className="text-xs">
                          {ann.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePin(ann)}
                            className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                            title={ann.isPinned ? 'Unpin' : 'Pin'}
                          >
                            {ann.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(ann)}
                            className="hover:bg-purple-100 hover:text-purple-600 rounded-xl transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleting(ann); setShowDeleteDialog(true); }}
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
        <DialogContent className="max-w-lg border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {editing ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editing ? 'Update announcement details' : 'Create a new announcement for your users'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Title *</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-700">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {['General', 'Academic', 'Exam', 'Event', 'Holiday', 'Urgent', 'Other'].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-gray-700">Expiry Date (optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                  <Label className="text-gray-700 text-sm">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPinned}
                    onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })}
                  />
                  <Label className="text-gray-700 text-sm">Pinned</Label>
                </div>
              </div>
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
              This will permanently delete the announcement &quot;{deleting?.title}&quot;. This action cannot be undone.
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

export default AnnouncementManagement;
