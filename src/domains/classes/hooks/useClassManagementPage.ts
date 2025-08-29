import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { Class, deleteClass } from '../classesSlice';
import { toast } from '@/hooks/use-toast';
import { useClassesData } from '@/data/hooks/useClassesData';
import { useClassroomsData } from '@/data/hooks/useClassroomsData';

export type SubjectFilter = 'all' | 'English' | 'Mathematics' | 'Physics';
export type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const useClassManagementPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { classes, loading } = useAppSelector(
    (state: RootState) => state.classes
  );
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);

  // Load domain-specific data with dependencies
  const classesHook = useClassesData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });


  const classroomsHook = useClassroomsData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [showOnlyWithAvailableSlots, setShowOnlyWithAvailableSlots] =
    useState(false); // UI state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Filtered classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      subjectFilter === 'all' || classItem.subject === subjectFilter;
    const matchesLevel =
      levelFilter === 'all' || classItem.level === levelFilter;

    const matchesAvailableSlots =
      !showOnlyWithAvailableSlots || classItem.students < classItem.maxStudents;

    return (
      matchesSearch && matchesSubject && matchesLevel && matchesAvailableSlots
    );
  });

  // Handlers
  const handleAddClass = () => {
    navigate('/classes/new');
  };

  const handleEdit = (classItem: Class) => {
    navigate(`/classes/edit/${classItem.id}`);
  };

  const handleDelete = (classItem: Class) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const handleView = (classItem: Class) => {
    // Handle view functionality - could navigate to class detail page
    console.log('Viewing class:', classItem);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        dispatch(deleteClass(classToDelete.id));
        toast({
          title: 'Class Deleted',
          description: `${classToDelete.name} has been successfully deleted.`,
          variant: 'default',
        });
        setShowDeleteDialog(false);
        setClassToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete class. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'subject':
        if (
          value === 'all' ||
          value === 'English' ||
          value === 'Mathematics' ||
          value === 'Physics'
        ) {
          setSubjectFilter(value as SubjectFilter);
        }
        break;
      case 'level':
        if (
          value === 'all' ||
          value === 'A1' ||
          value === 'A2' ||
          value === 'B1' ||
          value === 'B2' ||
          value === 'C1' ||
          value === 'C2'
        ) {
          setLevelFilter(value as LevelFilter);
        }
        break;
      case 'availableSlots':
        setShowOnlyWithAvailableSlots(value === 'true');
        break;
    }
  };
  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
    setLevelFilter('all');
    setShowOnlyWithAvailableSlots(false);
  };

  const hasFilters =
    searchTerm !== '' ||
    subjectFilter !== 'all' ||
    levelFilter !== 'all' ||
    showOnlyWithAvailableSlots;

  return {
    // Data
    classes,
    filteredClasses,
    loading,
    teachers,
    classrooms, // Filter state
    searchTerm,
    setSearchTerm,
    subjectFilter,
    setSubjectFilter,
    levelFilter,
    setLevelFilter,
    showOnlyWithAvailableSlots,
    setShowOnlyWithAvailableSlots,
    hasFilters,
    clearFilters,

    // UI state
    showDeleteDialog,
    setShowDeleteDialog,
    classToDelete,

    // Handlers
    handleAddClass,
    handleEdit,
    handleDelete,
    handleView,
    confirmDelete,
    handleFilterChange,
  };
};
