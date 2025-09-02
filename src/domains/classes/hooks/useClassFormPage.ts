import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassesApi } from '@/domains/classesApi/hooks/useClassesApi';
import { teacherApiService } from '@/services/teacherApiService';
import classroomApiService from '@/services/classroomApiService';
import { ClassFormData } from '@/types/api/class';
import { ClassResponse } from '@/types/api/class';

export const useClassFormPage = (classId?: string) => {
  const navigate = useNavigate();
  const { classes, loadClasses, create, update } = useClassesApi();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [classItem, setClassItem] = useState<ClassResponse | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects] = useState([
    { id: 'english', name: 'English' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' },
    { id: 'art', name: 'Art' },
  ]);

  // Load class by ID in edit mode
  useEffect(() => {
    const loadClass = async () => {
      if (!classId) return;
      setLoading(true);
      setFormError(null);
      try {
        await loadClasses();
        const foundClass = classes.find(c => c.id === classId);
        if (foundClass) {
          setClassItem(foundClass);
        } else {
          setFormError('Class not found');
        }
      } catch (err: any) {
        setFormError(err?.message || 'Failed to load class');
      } finally {
        setLoading(false);
      }
    };
    loadClass();
  }, [classId, loadClasses, classes]);

  // Load teachers (global loading handled by interceptor)
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teachersData = await teacherApiService.getAllTeachers();
        setTeachers(teachersData);
      } catch (err: any) {
        console.error('Failed to load teachers:', err);
        setTeachers([]);
      }
    };
    loadTeachers();
  }, []);

  // Load classrooms (global loading handled by interceptor)
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const classroomsData = await classroomApiService.getAllClassrooms();
        setClassrooms(classroomsData);
      } catch (err: any) {
        console.error('Failed to load classrooms:', err);
        setClassrooms([]);
      }
    };
    loadClassrooms();
  }, []);

  // Handle loading state
  const isLoading = loading || (classId ? !classItem && !error : false);

  const handleSubmit = async (data: ClassFormData) => {
    setLoading(true);
    setFormError(null);

    try {
      if (classItem && classId) {
        await update(classId, data);
      } else {
        await create(data);
      }
      navigate('/classes');
    } catch (error: any) {
      // For conflict errors (409), don't set form error as they're handled by toast
      // and we want to keep the form data intact
      if (error?.status !== 409) {
        const msg = classItem 
          ? error?.message || 'Failed to update class'
          : error?.message || 'Failed to create class';
        setFormError(msg);
      }
      // For all errors (including 409), don't navigate away
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/classes');
  };

  return {
    classItem,
    teachers,
    classrooms,
    subjects,
    loading: isLoading,
    error,
    handleSubmit,
    handleCancel,
  };
};
