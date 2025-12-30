import { useState, useCallback, useMemo } from 'react';

export type StatusFilter = 'all' | 'active' | 'inactive';
export type DiscountFilter = 'all' | 'with-discount' | 'no-discount';
export type PaymentFilter = 'all' | 'has-obligations' | 'no-obligations';

interface UseStudentFilterStateReturn {
  // Filter values
  searchTerm: string;
  statusFilter: StatusFilter;
  teacherFilter: string;
  discountFilter: DiscountFilter;
  paymentFilter: PaymentFilter;

  // Computed
  hasActiveFilters: boolean;

  // Setters
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setTeacherFilter: (teacherId: string) => void;
  setDiscountFilter: (discount: DiscountFilter) => void;
  setPaymentFilter: (payment: PaymentFilter) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing student filter state.
 * Provides filter values, setters, and computed properties.
 */
export const useStudentFilterState = (): UseStudentFilterStateReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      statusFilter !== 'all' ||
      teacherFilter !== 'all' ||
      discountFilter !== 'all' ||
      paymentFilter !== 'all'
    );
  }, [searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTeacherFilter('all');
    setDiscountFilter('all');
    setPaymentFilter('all');
  }, []);

  return {
    searchTerm,
    statusFilter,
    teacherFilter,
    discountFilter,
    paymentFilter,
    hasActiveFilters,
    setSearchTerm,
    setStatusFilter,
    setTeacherFilter,
    setDiscountFilter,
    setPaymentFilter,
    clearFilters,
  };
};
