import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Student, studentService } from '../../services/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const StudentPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Student },
    { header: 'Email', accessor: 'email' as keyof Student },
    { header: 'Status', accessor: 'status' as keyof Student },
  ];

  return (
    <div>
      <PageHeader 
        title="Students" 
        description="Manage enrolled students"
        action={
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        }
      />
      <div className="mt-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <GenericTable 
            data={students} 
            columns={columns} 
            onEdit={() => {}} 
            onDelete={() => {}} 
          />
        )}
      </div>
    </div>
  );
};

export default StudentPage;
