import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherErrorHandlers } from '@/utils/apiErrorHandler';
import { TeacherFormData, SubjectDto } from '@/types/api/teacher';
import type { Teacher } from '../../teachersSlice';

/**
 * Hook for teacher form page workflows
 * Handles loading teacher by ID and form submission with navigation
 */
export const useTeacherFormPage = (teacherId?: string) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);

  // Load teacher by ID from API in edit mode
  useEffect(() => {
    const loadTeacher = async () => {
      if (!teacherId) return;

      setTeacherLoading(true);
      setFormError(null);
      try {
        const t = await teacherApiService.getTeacherById(teacherId);
        setTeacher(t);
      } catch (err) {
        const msg = TeacherErrorHandlers.fetchById(err);
        setFormError(msg);
      } finally {
        setTeacherLoading(false);
      }
    };
    loadTeacher();
  }, [teacherId]);

  // Load subjects for the dropdown
  useEffect(() => {
    const loadSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const s = await teacherApiService.getAllSubjects();
        setSubjects(s);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setSubjectsLoading(false);
      }
    };
    loadSubjects();
  }, []);

  // Handle loading state
  const isLoading = teacherLoading || subjectsLoading || (teacherId ? !teacher && !error : false);

  const handleSubmit = async (data: TeacherFormData): Promise<{ id: string }> => {
    setLoading(true);
    setFormError(null);

    try {
      if (teacher) {
        await teacherApiService.updateTeacher(teacher.id, data);
        navigate('/teachers');
        return { id: teacher.id };
      } else {
        const result = await teacherApiService.createTeacher(data);
        navigate('/teachers');
        return { id: result.id };
      }
    } catch (err) {
      const msg = teacher ? TeacherErrorHandlers.update(err) : TeacherErrorHandlers.create(err);
      setFormError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teachers');
  };

  return {
    teacher,
    subjects,
    loading: isLoading || loading,
    error,
    handleSubmit,
    handleCancel,
  };
};
