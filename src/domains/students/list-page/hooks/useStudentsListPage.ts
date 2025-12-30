import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/domains/students/_shared/hooks/useStudents';
import { useStudentFilterState } from '@/domains/students/_shared/hooks/useStudentFilterState';
import { Student } from '@/domains/students/studentsSlice';
import { StudentSearchParams } from '@/types/api/student';
import { getAllTeachers } from '@/services/teacherApiService';

export type StudentViewMode = 'grid' | 'table';

/**
 * List page orchestration hook for the Students domain.
 *
 * Combines:
 * - useStudents (API operations + Redux state)
 * - useStudentFilters (filter state management)
 * - Navigation handlers
 * - UI state (view mode, dialogs)
 * - Debounced search
 *
 * Pattern follows the Classes domain list page hooks.
 */
export const useStudentsListPage = () => {
  const navigate = useNavigate();

  // Primary hook for API operations and Redux state
  const {
    students,
    all: allStudents,
    discountTypes,
    searchResults,
    selectedStudent,
    totalCount,
    currentPage,
    pageSize,
    loading,
    errors,
    isSearchMode,
    searchParams,
    loadStudents,
    loadDiscountTypes,
    search,
    create,
    update,
    remove,
    setSearchQuery,
    setSearchMode,
    setSelectedStudent,
    setCurrentPage,
    setPageSize,
  } = useStudents();

  // Filter state management
  const {
    searchTerm,
    statusFilter,
    teacherFilter,
    discountFilter,
    paymentFilter,
    hasActiveFilters,
    setSearchTerm: setFilterSearchTerm,
    setStatusFilter,
    setTeacherFilter,
    setDiscountFilter,
    setPaymentFilter,
    clearFilters: clearFilterState,
  } = useStudentFilterState();

  // Local UI state
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFiltersRef = useRef({
    searchTerm: '',
    statusFilter: 'all' as 'all' | 'active' | 'inactive',
    teacherFilter: 'all',
    discountFilter: 'all' as 'all' | 'with-discount' | 'no-discount',
    paymentFilter: 'all' as 'all' | 'has-obligations' | 'no-obligations',
  });

  // Filtered students for local filtering (when not using API search)
  const filteredStudents = useMemo(() => {
    if (isSearchMode) {
      return searchResults || [];
    }

    if (!allStudents) return [];

    return allStudents.filter((student) => {
      if (!searchTerm && statusFilter === 'all' && teacherFilter === 'all' && discountFilter === 'all') {
        return true;
      }

      const matchesSearch =
        !searchTerm ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && student.isActive) ||
        (statusFilter === 'inactive' && !student.isActive);

      const matchesTeacher =
        teacherFilter === 'all' ||
        student.currentTeacherName === teachers.find((t) => t.id === teacherFilter)?.name;

      const matchesDiscount =
        discountFilter === 'all' ||
        (discountFilter === 'with-discount' && student.hasDiscount) ||
        (discountFilter === 'no-discount' && !student.hasDiscount);

      return matchesSearch && matchesStatus && matchesTeacher && matchesDiscount;
    });
  }, [allStudents, searchResults, searchTerm, statusFilter, teacherFilter, discountFilter, isSearchMode, teachers]);

  // Load teachers
  const loadTeachers = useCallback(async () => {
    try {
      const teachersData = await getAllTeachers();
      setTeachers(teachersData.map((t) => ({ id: t.id, name: t.name })));
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  }, []);

  // Set search term (updates both filter state and Redux)
  const setSearchTerm = useCallback(
    (term: string) => {
      setFilterSearchTerm(term);
      setSearchQuery(term);
    },
    [setFilterSearchTerm, setSearchQuery]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    clearFilterState();
    setSearchQuery('');
    setSearchMode(false);
    loadStudents();
  }, [clearFilterState, setSearchQuery, setSearchMode, loadStudents]);

  // Search students with API
  const searchStudentsApi = useCallback(
    async (params: StudentSearchParams) => {
      try {
        await search(params);
      } catch {
        // Error handled by useStudents
      }
    },
    [search]
  );

  // Debounced filter effect - triggers search only when filters actually change
  useEffect(() => {
    if (!isInitialized) return;

    const currentFilters = { searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter };
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFiltersRef.current);

    if (!filtersChanged) return;

    previousFiltersRef.current = currentFilters;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (hasActiveFilters) {
        setIsSearching(true);
        const startTime = Date.now();

        try {
          const params: StudentSearchParams = {
            searchTerm: searchTerm.trim() || undefined,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            hasDiscount: discountFilter === 'all' ? undefined : discountFilter === 'with-discount',
            teacherId: teacherFilter === 'all' ? undefined : teacherFilter,
            skip: 0,
            take: pageSize,
          };

          await searchStudentsApi(params);

          // Ensure minimum loading duration for better UX
          const elapsed = Date.now() - startTime;
          const minDuration = 500;
          if (elapsed < minDuration) {
            await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchMode(false);
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter, isInitialized, hasActiveFilters, pageSize, searchStudentsApi, setSearchMode]);

  // Exit search mode when no filters are active
  useEffect(() => {
    if (isInitialized && !hasActiveFilters && isSearchMode) {
      setSearchMode(false);
    }
  }, [isInitialized, hasActiveFilters, isSearchMode, setSearchMode]);

  // Pagination handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      if (isSearchMode) {
        const params: StudentSearchParams = {
          ...searchParams,
          skip: (page - 1) * pageSize,
          take: pageSize,
        };
        searchStudentsApi(params);
      }
    },
    [isSearchMode, searchParams, pageSize, searchStudentsApi, setCurrentPage]
  );

  // Navigation handlers
  const handleAddStudent = useCallback(() => {
    navigate('/students/new');
  }, [navigate]);

  const handleEditStudent = useCallback(
    (student: Student) => {
      navigate(`/students/edit/${student.id}`);
    },
    [navigate]
  );

  const handleViewStudent = useCallback(
    (student: Student) => {
      navigate(`/students/${student.id}`);
    },
    [navigate]
  );

  // Initialize data on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await Promise.all([loadStudents(), loadDiscountTypes(), loadTeachers()]);
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize students:', error);
        if (mounted) {
          setIsInitialized(true); // Still mark as initialized to show error state
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadStudents, loadDiscountTypes, loadTeachers]);

  return {
    // Data
    students: filteredStudents,
    discountTypes,
    totalCount: isSearchMode ? totalCount : filteredStudents.length,
    currentPage,
    pageSize,
    isSearchMode,

    // Loading states
    loading,
    isLoading: loading.creating || loading.updating || loading.deleting,
    isSearching,
    isInitialized,

    // Error states
    errors,

    // Filter state
    searchTerm,
    statusFilter,
    teacherFilter,
    discountFilter,
    paymentFilter,
    teachers,
    hasActiveFilters,
    searchParams,

    // View state
    viewMode,
    setViewMode,

    // Selected student
    selectedStudent,
    setSelectedStudent,

    // API operations
    loadStudents,
    loadDiscountTypes,
    createStudent: create,
    updateStudent: update,
    deleteStudent: remove,
    searchStudents: searchStudentsApi,

    // Navigation handlers
    handleAddStudent,
    handleEditStudent,
    handleViewStudent,

    // Filter handlers
    setSearchTerm,
    setStatusFilter,
    setTeacherFilter,
    setDiscountFilter,
    setPaymentFilter,
    clearFilters,

    // Pagination handlers
    handlePageChange,
    setPageSize,
  };
};
