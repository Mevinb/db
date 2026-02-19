import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Semester, semesterService } from '../../services/api';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

const SemesterPage = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Semester | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Semester>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setValue('name', editingItem.name);
      setValue('startDate', editingItem.startDate);
      setValue('endDate', editingItem.endDate);
      setValue('isActive', editingItem.isActive);
      setIsModalOpen(true);
    } else {
      reset();
    }
  }, [editingItem, setValue, reset]);

  const loadData = async () => {
    try {
      const data = await semesterService.getAll();
      setSemesters(data);
    } catch (error) {
      toast.error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Semester) => {
    try {
      if (editingItem) {
        await semesterService.update(editingItem.id, data);
        toast.success('Semester updated successfully');
      } else {
        await semesterService.create(data);
        toast.success('Semester created successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
      loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (item: Semester) => {
    if (confirm('Are you sure you want to delete this semester?')) {
      await semesterService.delete(item.id);
      toast.success('Semester deleted');
      loadData();
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Semester },
    { header: 'Start Date', accessor: 'startDate' as keyof Semester },
    { header: 'End Date', accessor: 'endDate' as keyof Semester },
    { 
      header: 'Status', 
      accessor: (item: Semester) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.isActive 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {item.isActive ? 'Active' : 'Past'}
        </span>
      )
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Semesters" 
        description="Manage academic semesters and terms"
        action={
          <button 
            onClick={() => {
              setEditingItem(null);
              reset();
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            <Plus size={18} />
            <span>Add Semester</span>
          </button>
        }
      />
      
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : (
          <GenericTable 
            data={semesters} 
            columns={columns}
            onEdit={setEditingItem}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-slate-800">
                {editingItem ? 'Edit Semester' : 'Add New Semester'}
              </Dialog.Title>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester Name</label>
                <input 
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Fall 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date"
                    {...register('startDate', { required: true })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date"
                    {...register('endDate', { required: true })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Currently Active Semester</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {editingItem ? 'Update Semester' : 'Create Semester'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default SemesterPage;
