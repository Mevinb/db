import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Program, programService } from '../../services/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const ProgramPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await programService.getAll();
      setPrograms(data);
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Program },
    { header: 'Duration (Years)', accessor: 'duration' as keyof Program },
  ];

  return (
    <div>
      <PageHeader 
        title="Programs" 
        description="Manage academic programs"
        action={
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span>Add Program</span>
          </button>
        }
      />
      <div className="mt-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <GenericTable 
            data={programs} 
            columns={columns} 
            onEdit={() => {}} 
            onDelete={() => {}} 
          />
        )}
      </div>
    </div>
  );
};

export default ProgramPage;
