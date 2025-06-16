import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { selectStudents, selectLoading, Student } from '../studentsSlice';
import { useInitializeStudents } from './useInitializeStudents';
import {
  useStudentFilters,
  getStudentPaymentStatus,
} from './useStudentFilters';

export const useStudentManagement = () => {
  const navigate = useNavigate();
  const students = useAppSelector(selectStudents);
  const loading = useAppSelector(selectLoading);
  const classes = useAppSelector((state: RootState) => state.classes.classes);
  const paymentObligations = useAppSelector(
    (state: RootState) => state.finance.obligations
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    'all' | 'pending' | 'partial' | 'paid' | 'overdue'
  >('all');
  const [classFilter, setClassFilter] = useState<'all' | 'unassigned' | string>(
    'all'
  );

  // Populate store with mock data when needed
  useInitializeStudents();

  const filteredStudents = useStudentFilters({
    students,
    obligations: paymentObligations,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    classFilter,
  });

  const getStudentPaymentStatusWrapper = (studentId: string) => {
    return getStudentPaymentStatus(studentId, paymentObligations || []);
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setClassFilter('all');
  };

  return {
    students: filteredStudents,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    classFilter,
    setClassFilter,
    clearFilters,
    classes,
    getStudentPaymentStatus: getStudentPaymentStatusWrapper,
    handleViewStudent,
  };
};
