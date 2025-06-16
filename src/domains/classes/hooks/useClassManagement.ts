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
import { ClassStatus } from '@/types/enums';
import { useMockData } from '@/data/hooks/useMockData';

interface UseClassManagementProps {
  searchTerm: string;
  subjectFilter: 'all' | 'English' | 'Mathematics' | 'Physics';
  levelFilter: 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  statusFilter: 'all' | 'active' | 'inactive';
  showOnlyWithAvailableSlots: boolean;
}

export const useClassManagement = ({
  searchTerm,
  subjectFilter,
  levelFilter,
  statusFilter,
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
  }, [classes.length, dataLoading, refreshClasses]);

  // Filter classes based on criteria
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === 'all' || classItem.subject === subjectFilter;
    const matchesLevel =
      levelFilter === 'all' || classItem.level === levelFilter;
    const matchesStatus =
      statusFilter === 'all' || classItem.status === statusFilter;
    const matchesAvailableSlots =
      !showOnlyWithAvailableSlots || classItem.students < classItem.maxStudents;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesLevel &&
      matchesStatus &&
      matchesAvailableSlots
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
              avatar: selectedTeacher.avatar,
            }
          : { id: '', name: '', subject: '', avatar: '/placeholder.svg' },
        students: data.studentIds ? data.studentIds.length : 0, // Set student count based on selected students
        maxStudents: 20,
        studentIds: data.studentIds || [], // Include selected student IDs
        room: selectedClassroom?.name || '',
        roomId: data.classroomId, // Store classroom ID reference
        schedule: data.schedule,
        status: data.status as ClassStatus,
        subject: data.subject,
        level: 'A1',
        price: 75,
        duration: 90,
        description: '',
        requirements: '',
        objectives: [],
        materials: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#3B82F6',
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
              avatar: selectedTeacher.avatar,
            }
          : undefined,
        room: selectedClassroom?.name || '',
        roomId: data.classroomId,
        schedule: data.schedule,
        status: data.status as ClassStatus,
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
