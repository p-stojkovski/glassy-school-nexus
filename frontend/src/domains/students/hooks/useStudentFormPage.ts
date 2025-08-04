import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addStudent,
  updateStudent,
  selectStudentById,
  setError,
  selectError,
  Student,
} from '../studentsSlice';
import { StudentStatus, DiscountType } from '@/types/enums';
import { toast } from 'sonner';
import { useStudentsData } from '@/data/hooks/useStudentsData';

type StudentFormData = {
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  parentContact: string;
  parentEmail?: string;
  dateOfBirth?: string;
  joiningDate: string;
  placeOfBirth?: string;
  notes?: string;
  discountType?: DiscountType;
  discountAmount?: number;
};

export const useStudentFormPage = (studentId?: string) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: studentsData, isLoading: studentsLoading } = useStudentsData();
  
  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  
  const student = useAppSelector((state) => 
    studentId ? selectStudentById(state, studentId) : null
  );
  const reduxError = useAppSelector(selectError);

  // Handle loading state - we're loading if students are loading or if we're in edit mode but don't have the student yet
  const isLoading = studentsLoading || (studentId && !student && !error);

  // Check if student exists when in edit mode
  useEffect(() => {
    if (studentId && !studentsLoading && studentsData && studentsData.length > 0) {
      const foundStudent = studentsData.find(s => s.id === studentId);
      if (!foundStudent) {
        setFormError('Student not found');
      } else {
        setFormError(null);
      }
    }
  }, [studentId, studentsData, studentsLoading]);

  // Handle Redux errors
  useEffect(() => {
    if (reduxError) {
      setFormError(reduxError);
      dispatch(setError(null));
    }
  }, [reduxError, dispatch]);

  const handleSubmit = (data: StudentFormData) => {
    setLoading(true);
    setFormError(null);

    if (student) {
      // Update existing student
      const { joiningDate, ...restData } = data;
      const updatedStudent: Student = {
        ...student,
        ...restData,
        joinDate: joiningDate,
      };
      dispatch(updateStudent(updatedStudent));
      toast.success('Student Updated', {
        description: `${data.name} has been successfully updated.`,
      });
    } else {
      // Add new student
      const { joiningDate, ...restData } = data;
      const newStudent: Student = {
        id: Date.now().toString(),
        classId: 'unassigned',
        joinDate: joiningDate,
        paymentDue: false,
        lastPayment: new Date().toISOString(),
        ...restData,
      };
      dispatch(addStudent(newStudent));
      toast.success('Student Added', {
        description: `${data.name} has been successfully added.`,
      });
    }

    setLoading(false);
    // Navigate back to students list
    navigate('/students');
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return {
    student,
    loading: isLoading || loading,
    error: error,
    handleSubmit,
    handleCancel,
  };
};