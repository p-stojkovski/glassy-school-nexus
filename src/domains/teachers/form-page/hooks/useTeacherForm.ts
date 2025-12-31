import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteTeacher,
  setError,
  selectErrors,
  Teacher,
} from '../../teachersSlice';
import { toast } from 'sonner';

/**
 * Hook for managing teacher form dialog state
 * Use this for opening/closing create/edit sheets
 */
export const useTeacherForm = () => {
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);
  const error = errors.delete || errors.create || errors.update;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const confirmDeleteTeacher = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete.id));
      toast.success('Teacher Deleted', {
        description: `${teacherToDelete.name} has been successfully deleted.`,
      });
      setTeacherToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
  };

  useEffect(() => {
    if (error) {
      toast.error('Error', {
        description: error,
      });
      dispatch(setError({ operation: 'delete', error: null }));
    }
  }, [error, dispatch]);

  return {
    isFormOpen,
    selectedTeacher,
    teacherToDelete,
    setTeacherToDelete,
    handleAddTeacher,
    handleEditTeacher,
    handleDeleteTeacher,
    confirmDeleteTeacher,
    handleCloseForm,
    setIsFormOpen,
  };
};
