import { useMemo } from 'react';
import { Student } from '../studentsSlice';
import { PaymentObligation } from '@/store/slices/financeSlice';

export const getStudentPaymentStatus = (
  studentId: string,
  obligations: PaymentObligation[]
): 'pending' | 'partial' | 'paid' | 'overdue' => {
  if (!obligations || obligations.length === 0) {
    return 'paid';
  }

  const studentObligations = obligations.filter(
    (obligation) => obligation.studentId === studentId
  );

  if (studentObligations.length === 0) {
    return 'paid';
  }

  const hasOverdue = studentObligations.some(
    (obligation) => obligation.status === 'overdue'
  );
  const hasPending = studentObligations.some(
    (obligation) => obligation.status === 'pending'
  );
  const hasPartial = studentObligations.some(
    (obligation) => obligation.status === 'partial'
  );
  const allPaid = studentObligations.every(
    (obligation) => obligation.status === 'paid'
  );

  if (hasOverdue) return 'overdue';
  if (allPaid) return 'paid';
  if (hasPartial) return 'partial';
  if (hasPending) return 'pending';
  return 'pending';
};

interface UseStudentFiltersProps {
  students: Student[];
  obligations: PaymentObligation[];
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  paymentStatusFilter: 'all' | 'pending' | 'partial' | 'paid' | 'overdue';
  classFilter: 'all' | 'unassigned' | string;
}

export const useStudentFilters = ({
  students,
  obligations,
  searchTerm,
  statusFilter,
  paymentStatusFilter,
  classFilter,
}: UseStudentFiltersProps): Student[] =>
  useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || student.status === statusFilter;

        const studentPaymentStatus = getStudentPaymentStatus(
          student.id,
          obligations
        );
        const matchesPaymentStatus =
          paymentStatusFilter === 'all' ||
          studentPaymentStatus === paymentStatusFilter;

        let matchesClass = true;
        if (classFilter !== 'all') {
          if (classFilter === 'unassigned') {
            matchesClass = !student.classId || student.classId === 'unassigned';
          } else {
            matchesClass = student.classId === classFilter;
          }
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPaymentStatus &&
          matchesClass
        );
      }),
    [
      students,
      obligations,
      searchTerm,
      statusFilter,
      paymentStatusFilter,
      classFilter,
    ]
  );

