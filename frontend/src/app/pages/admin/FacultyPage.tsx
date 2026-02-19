import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import GenericTable from '../../components/GenericTable';
import { Faculty, facultyService } from '../../services/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const FacultyPage = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await facultyService.getAll();
      setFaculty(data);
    } catch (error) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Faculty },
    { header: 'Email', accessor: 'email' as keyof Faculty },
    { header: 'Designation', accessor: 'designation' as keyof Faculty },
  ];

  return (
    <div>
      <PageHeader 
        title="Faculty" 
        description="Manage faculty members"
        action={
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span>Add Faculty</span>
          </button>
        }
      />
      <div className="mt-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <GenericTable 
            data={faculty} 
            columns={columns} 
            onEdit={() => {}} 
            onDelete={() => {}} 
          />
        )}
      </div>
    </div>
  );
};

export default FacultyPage;
