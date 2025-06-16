import { useState, useMemo } from 'react';
import { useClassrooms } from './useClassrooms';
import { Classroom } from '../classroomsSlice';
import { ClassroomStatus } from '@/types/enums';
import { useToast } from '@/hooks/use-toast';
import { useClassroomsData } from '@/data/hooks/useClassroomsData';

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

  // Load classrooms data when needed
  const classroomsHook = useClassroomsData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });

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
    classroomToDelete, // Handlers
    handleAddClassroom,
    handleEditClassroom,
    handleDeleteClassroom,
    handleViewClassroom,
    handleCloseForm,
    handleSubmit,
    confirmDeleteClassroom,

    // UI state setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};
