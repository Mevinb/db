import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Course, courseService, Program, programService } from '../../services/api';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

const CoursePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Course>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setValue('name', editingItem.name);
      setValue('code', editingItem.code);
      setValue('credits', editingItem.credits);
      setValue('programId', editingItem.programId);
      setValue('description', editingItem.description || '');
      setIsModalOpen(true);
    } else {
      reset();
    }
  }, [editingItem, setValue, reset]);

  const loadData = async () => {
    try {
      const [coursesData, programsData] = await Promise.all([
        courseService.getAll(),
        programService.getAll()
      ]);
      setCourses(coursesData);
      setPrograms(programsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Course) => {
    try {
      if (editingItem) {
        await courseService.update(editingItem.id, data);
        toast.success('Course updated successfully');
      } else {
        await courseService.create(data);
        toast.success('Course created successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
      loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (item: Course) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await courseService.delete(item.id);
      toast.success('Course deleted');
      loadData();
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof Course },
    { header: 'Name', accessor: 'name' as keyof Course },
    { header: 'Credits', accessor: 'credits' as keyof Course },
    { 
      header: 'Program', 
      accessor: (item: Course) => programs.find(p => p.id === item.programId)?.name || 'Unknown' 
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Courses" 
        description="Manage academic courses and curriculum"
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
            <span>Add Course</span>
          </button>
        }
      />
      
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : (
          <GenericTable 
            data={courses} 
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
                {editingItem ? 'Edit Course' : 'Add New Course'}
              </Dialog.Title>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input 
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Introduction to Computing"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                  <input 
                    {...register('code', { required: true })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                  <input 
                    type="number"
                    {...register('credits', { required: true, min: 1, max: 6 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select 
                  {...register('programId', { required: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
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
                  {editingItem ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default CoursePage;
