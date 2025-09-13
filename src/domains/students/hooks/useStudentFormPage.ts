import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentManagement } from './useStudentManagement';
import { studentApiService } from '@/services/studentApiService';
import { StudentErrorHandlers } from '@/utils/apiErrorHandler';
import { StudentFormData } from '@/types/api/student';
import type { Student } from '../studentsSlice';

export const useStudentFormPage = (studentId?: string) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  
  // Load student by ID from API in edit mode
  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) return;
      
      // Disable global loading to use page-specific spinner
      studentApiService
      
      setStudentLoading(true);
      setFormError(null);
      try {
        const s = await studentApiService.getStudentById(studentId);
        setStudent(s);
      } catch (err) {
        const msg = StudentErrorHandlers.fetchById(err);
        setFormError(msg);
      } finally {
        setStudentLoading(false);
        // Keep global loading disabled to maintain consistency with main students page
        // studentApiService
      }
    };
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Handle loading state
  const isLoading = studentLoading || (studentId ? !student && !error : false);

  const { createStudent: createStudentApi, updateStudent: updateStudentApi } = useStudentManagement();

  const handleSubmit = async (data: StudentFormData) => {
    setLoading(true);
    setFormError(null);

    try {
      if (student) {
        await updateStudentApi(student.id, data);
      } else {
        await createStudentApi(data);
      }
      navigate('/students');
    } catch (error) {
      const msg = student ? StudentErrorHandlers.update(error) : StudentErrorHandlers.create(error);
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return {
    student,
    loading: isLoading || loading,
    error,
    handleSubmit,
    handleCancel,
  };
};

