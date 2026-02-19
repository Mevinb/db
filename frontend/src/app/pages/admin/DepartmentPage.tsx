import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Department, departmentService } from '../../services/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const DepartmentPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Department },
    { header: 'Code', accessor: 'code' as keyof Department },
    { header: 'Description', accessor: 'description' as keyof Department },
  ];

  return (
    <div>
      <PageHeader 
        title="Departments" 
        description="Manage university departments"
        action={
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span>Add Department</span>
          </button>
        }
      />
      
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : (
          <GenericTable 
            data={departments} 
            columns={columns}
            onEdit={() => toast.info('Edit functionality not implemented for this demo')}
            onDelete={() => toast.info('Delete functionality not implemented for this demo')}
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentPage;
