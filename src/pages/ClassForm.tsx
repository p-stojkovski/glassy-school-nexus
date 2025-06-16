import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import ClassFormContent, {
  ClassFormData,
} from '@/domains/classes/components/forms/ClassFormContent';
import { useClassManagement } from '@/domains/classes/hooks/useClassManagement';
import { DemoManager } from '@/data/components/DemoManager';
import { useClassrooms } from '@/domains/classrooms/hooks/useClassrooms';
import { Classroom } from '@/domains/classrooms/classroomsSlice';

const ClassForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { classrooms, setClassrooms } = useClassrooms();

  const editingClass = id ? classes.find((c) => c.id === id) : null;
  const isEditing = !!editingClass;
  // Initialize demo data on component mount
  useEffect(() => {
    // Only initialize if there's no data
    if (classrooms.length === 0) {
      const demoClassrooms: Classroom[] = [
        {
          id: 'classroom-1',
          name: 'Room 101',
          location: 'Building A, 1st Floor',
          capacity: 25,
          createdDate: '2023-01-15T10:00:00Z',
          lastUpdated: '2023-06-01T14:30:00Z',
        },
        {
          id: 'classroom-2',
          name: 'Room 202',
          location: 'Building A, 2nd Floor',
          capacity: 20,
          createdDate: '2023-01-15T10:30:00Z',
          lastUpdated: '2023-06-01T14:45:00Z',
        },
        {
          id: 'classroom-3',
          name: 'Room 305',
          location: 'Building B, 3rd Floor',
          capacity: 30,
          createdDate: '2023-01-16T09:00:00Z',
          lastUpdated: '2023-06-01T15:00:00Z',
        },
      ];
      setClassrooms(demoClassrooms);
    }
  }, [setClassrooms, classrooms.length]);

  // Use the management hook for CRUD
  const { handleCreateClass, handleUpdateClass } = useClassManagement({
    searchTerm: '',
    subjectFilter: 'all',
    levelFilter: 'all',
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
        {' '}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Edit Class' : 'Create New Class'}
          </h1>
          <p className="text-white/70">
            {isEditing
              ? 'Update class information and settings'
              : 'Add a new class to the system'}
          </p>
        </div>{' '}
      </div>

      <DemoManager
        showFullControls={true}
        title="Class Form Demo"
        description="Create and edit class information. All data is stored locally and persists between sessions."
      />

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
