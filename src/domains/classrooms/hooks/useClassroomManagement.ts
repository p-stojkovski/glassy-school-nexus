import { useState, useEffect, useMemo } from 'react';
import { useClassrooms } from './useClassrooms';
import { Classroom } from '../classroomsSlice';
import { ClassroomStatus } from '@/types/enums';
import { loadFromStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export type ClassroomFilterStatus =
  | 'all'
  | 'active'
  | 'inactive'
  | 'maintenance';

export interface ClassroomFormData {
  name: string;
  location?: string;
  capacity: number;
  status: ClassroomStatus;
}

export const useClassroomManagement = () => {
  const {
    classrooms,
    loading,
    setClassrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    setLoading,
    resetDemoClassrooms,
  } = useClassrooms();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ClassroomFilterStatus>('all');

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null
  );
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(
    null
  );

  const { toast } = useToast();

  // Mock data for demo mode
  const mockClassrooms: Classroom[] = [
    {
      id: '1',
      name: 'Room A-101',
      location: 'Building A, First Floor',
      capacity: 30,
      status: ClassroomStatus.Active,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Room B-205',
      location: 'Building B, Second Floor',
      capacity: 25,
      status: ClassroomStatus.Active,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Room C-301',
      location: 'Building C, Third Floor',
      capacity: 35,
      status: ClassroomStatus.Maintenance,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Initialize classrooms data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let loaded: Classroom[] | null = null;
      let error = false;
      try {
        loaded = loadFromStorage<Classroom[]>('classrooms');
      } catch (e) {
        error = true;
      }
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        setClassrooms(loaded);
      } else {
        setClassrooms(mockClassrooms);
        if (error) {
          toast({
            title: 'Storage Error',
            description:
              'Local storage is not available. Data will only persist for this session.',
            variant: 'warning',
          });
        }
      }
      setLoading(false);
    }, 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered classrooms
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((classroom) => {
      const matchesSearch =
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || classroom.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [classrooms, searchTerm, statusFilter]);

  // Handlers
  const handleAddClassroom = () => {
    setSelectedClassroom(null);
    setIsFormOpen(true);
  };

  const handleEditClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsFormOpen(true);
  };

  const handleDeleteClassroom = (classroom: Classroom) => {
    setClassroomToDelete(classroom);
    setIsConfirmOpen(true);
  };

  const handleViewClassroom = (classroom: Classroom) => {
    // Handle viewing classroom details - could navigate to detail page
    console.log('Viewing classroom:', classroom);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClassroom(null);
  };

  const handleSubmit = async (data: ClassroomFormData) => {
    try {
      if (selectedClassroom) {
        const updatedClassroom: Classroom = {
          ...selectedClassroom,
          ...data,
          lastUpdated: new Date().toISOString(),
        };
        updateClassroom(updatedClassroom);
        toast({
          title: 'Classroom Updated',
          description: `${data.name} has been successfully updated.`,
          variant: 'success',
        });
      } else {
        const newClassroom: Classroom = {
          id: Date.now().toString(),
          name: data.name,
          location: data.location || '',
          capacity: data.capacity,
          status: data.status,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        addClassroom(newClassroom);
        toast({
          title: 'Classroom Added',
          description: `${data.name} has been successfully added.`,
          variant: 'success',
        });
      }
      handleCloseForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteClassroom = () => {
    if (classroomToDelete) {
      deleteClassroom(classroomToDelete.id);
      toast({
        title: 'Classroom Deleted',
        description: `${classroomToDelete.name} has been successfully deleted.`,
        variant: 'default',
      });
      setClassroomToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleResetDemo = () => {
    resetDemoClassrooms(mockClassrooms);
    toast({
      title: 'Demo Data Reset',
      description: 'Classroom data has been reset to default values.',
      variant: 'info',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return {
    // Data
    classrooms,
    filteredClassrooms,
    loading,

    // Filter state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clearFilters,

    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedClassroom,
    classroomToDelete,

    // Handlers
    handleAddClassroom,
    handleEditClassroom,
    handleDeleteClassroom,
    handleViewClassroom,
    handleCloseForm,
    handleSubmit,
    confirmDeleteClassroom,
    handleResetDemo,

    // UI state setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};
