import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from './useStudents';
import { useStudentManagement } from './useStudentManagement';
import { getAllDiscountTypes, studentApiService } from '@/services/studentApiService';
import { StudentErrorHandlers } from '@/utils/apiErrorHandler';
import { StudentFormData } from '@/types/api/student';
import type { Student } from '../studentsSlice';

export const useStudentFormPage = (studentId?: string) => {
  const navigate = useNavigate();
  const { discountTypes, setDiscountTypes, setError: setDiscountError, clearError } = useStudents();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [discountTypesLoading, setDiscountTypesLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  
  // Load student by ID from API in edit mode
  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) return;
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
      }
    };
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Handle loading state
  const isLoading = studentLoading || (studentId ? !student && !error : false);

  // No-op: student is loaded via API above

  // Load discount types
  const loadDiscountTypes = async () => {
    if (discountTypes.length > 0) return; // Already loaded

    setDiscountTypesLoading(true);
    clearError('fetchDiscountTypes');

    try {
      const discountTypesData = await getAllDiscountTypes();
      setDiscountTypes(discountTypesData);
    } catch (error) {
      const errorMessage = StudentErrorHandlers.fetchDiscountTypes(error);
      setDiscountError('fetchDiscountTypes', errorMessage);
    } finally {
      setDiscountTypesLoading(false);
    }
  };

  // Load discount types on mount
  useEffect(() => {
    loadDiscountTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    discountTypes,
    loading: isLoading || loading || discountTypesLoading,
    error,
    handleSubmit,
    handleCancel,
  };
};
