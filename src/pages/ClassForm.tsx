
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ClassFormContent, { ClassFormData } from '../components/classes/ClassFormContent';
import { useClassManagement } from '../hooks/useClassManagement';

const ClassForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { classes } = useSelector((state: RootState) => state.classes);

  const editingClass = id ? classes.find(c => c.id === id) : null;
  const isEditing = !!editingClass;

  // Use the management hook for CRUD
  const { handleCreateClass, handleUpdateClass } = useClassManagement({
    searchTerm: '',
    subjectFilter: 'all',
    levelFilter: 'all',
    statusFilter: 'all',
    showOnlyWithAvailableSlots: false,
  });

  const handleSubmit = async (data: ClassFormData) => {
    if (isEditing && editingClass) {
      await handleUpdateClass(editingClass.id, data);
    } else {
      await handleCreateClass(data);
    }
    navigate('/classes');
  };

  const handleBack = () => {
    navigate('/classes');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Edit Class' : 'Create New Class'}
          </h1>
          <p className="text-white/70">
            {isEditing ? 'Update class information and settings' : 'Add a new class to the system'}
          </p>
        </div>
      </div>

      <div className="w-full">
        <ClassFormContent
          onSubmit={handleSubmit}
          onCancel={handleBack}
          editingClass={editingClass}
        />
      </div>
    </div>
  );
};

export default ClassForm;
