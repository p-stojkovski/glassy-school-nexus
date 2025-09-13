import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Class,
  setClasses,
  addClass,
  updateClass,
  deleteClass,
} from '../classesSlice';
import type { ClassFormData } from '../components/forms/ClassFormContent';
import { toast } from '@/hooks/use-toast';
import { useMockData } from '@/data/hooks/useMockData';

interface UseClassManagementProps {
  searchTerm: string;
  subjectFilter: 'all' | 'English' | 'Mathematics' | 'Physics';
  showOnlyWithAvailableSlots: boolean;
}

export const useClassManagement = ({
  searchTerm,
  subjectFilter,
  showOnlyWithAvailableSlots,
}: UseClassManagementProps) => {
  const dispatch = useAppDispatch();
  const { classes, loading } = useAppSelector(
    (state: RootState) => state.classes
  );
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);
  const { isLoading: dataLoading, refreshClasses } = useMockData();

  // Initialize classes data from MockDataService
  useEffect(() => {
    if (classes.length === 0 && !dataLoading) {
      // Trigger refresh to ensure data is loaded from MockDataService
      refreshClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length, dataLoading]);

  // Filter classes based on criteria
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === 'all' || classItem.subject === subjectFilter;
    const matchesAvailableSlots =
      !showOnlyWithAvailableSlots || classItem.students >= 0; // Always show since no max limit

    return (
      matchesSearch && matchesSubject && matchesAvailableSlots
    );
  });
  const handleCreateClass = async (data: ClassFormData) => {
    try {
      const selectedTeacher = teachers.find((t) => t.id === data.teacherId);
      const selectedClassroom = classrooms.find(
        (c) => c.id === data.classroomId
      );

      const newClass: Class = {
        id: `class-${Date.now()}`,
        name: data.name,
        teacher: selectedTeacher
          ? {
              id: selectedTeacher.id,
              name: selectedTeacher.name,
              subject: selectedTeacher.subject,
            }
          : { id: '', name: '', subject: '' },
        students: data.studentIds ? data.studentIds.length : 0, // Set student count based on selected students
        studentIds: data.studentIds || [], // Include selected student IDs
        room: selectedClassroom?.name || '',
        roomId: data.classroomId, // Store classroom ID reference
        schedule: data.schedule,
        subject: data.subject,
        description: '',
        requirements: '',
        objectives: [],
        materials: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch(addClass(newClass));
      toast({
        title: 'Class Created',
        description: `${newClass.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create class. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const handleUpdateClass = async (id: string, data: ClassFormData) => {
    try {
      const selectedTeacher = teachers.find((t) => t.id === data.teacherId);
      const selectedClassroom = classrooms.find(
        (c) => c.id === data.classroomId
      );

      const updatedFields: Partial<Class> = {
        name: data.name,
        teacher: selectedTeacher
          ? {
              id: selectedTeacher.id,
              name: selectedTeacher.name,
              subject: selectedTeacher.subject,
            }
          : undefined,
        room: selectedClassroom?.name || '',
        roomId: data.classroomId,
        schedule: data.schedule,
        subject: data.subject,
        students: data.studentIds ? data.studentIds.length : 0, // Update student count based on selected students
        studentIds: data.studentIds || [], // Include updated student IDs
        updatedAt: new Date().toISOString(),
      };

      dispatch(updateClass({ id, updates: updatedFields }));
      toast({
        title: 'Class Updated',
        description: 'Class has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      dispatch(deleteClass(id));
      toast({
        title: 'Class Deleted',
        description: 'Class has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    classes,
    loading,
    filteredClasses,
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass,
  };
};

