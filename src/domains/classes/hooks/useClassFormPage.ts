import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassesApi } from '@/domains/classesApi/hooks/useClassesApi';
import { classApiService } from '@/services/classApiService';
import { ClassFormData } from '@/types/api/class';
import { ClassResponse } from '@/types/api/class';

export const useClassFormPage = (classId?: string) => {
  const navigate = useNavigate();
  const { classes, loadClasses, create, update } = useClassesApi();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [classItem, setClassItem] = useState<ClassResponse | null>(null);
  // Removed teachers, classrooms, and subjects state - dropdown components handle data themselves

  // Load class by ID in edit mode
  useEffect(() => {
    const loadClass = async () => {
      if (!classId) return;
      setLoading(true);
      setFormError(null);
      try {
        // Call the individual endpoint directly to get full class details (skip global loading)
        const classData = await classApiService.getClassById(classId);
        setClassItem(classData);
      } catch (err: any) {
        if (err?.status === 404) {
          setFormError('Class not found');
        } else {
          setFormError(err?.message || 'Failed to load class');
        }
      } finally {
        setLoading(false);
      }
    };
    loadClass();
  }, [classId]);

  // Removed teachers and classrooms loading - dropdown components handle this themselves

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
    // Removed teachers, classrooms, subjects - dropdown components handle data themselves
    loading: isLoading,
    error,
    handleSubmit,
    handleCancel,
  };
};

