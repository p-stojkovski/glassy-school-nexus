import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useStudents } from './useStudents';
import { Student } from '../studentsSlice';
import {
  studentApiService,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getAllDiscountTypes,
} from '@/services/studentApiService';
import {
  showSuccessMessage,
} from '@/utils/apiErrorHandler';
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentSearchParams,
} from '@/types/api/student';
import {
  validateAndPrepareStudentData,
} from '@/utils/validation/studentValidators';
import { StudentErrorHandlers } from '@/utils/apiErrorHandler';

export type StudentViewMode = 'grid' | 'table';

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  enrollmentDate: string;
  isActive: boolean;
  parentContact?: string;
  parentEmail?: string;
  placeOfBirth?: string;
  hasDiscount: boolean;
  discountTypeId?: string;
  discountAmount: number;
  notes?: string;
}

export const useStudentManagement = () => {
  const {
    displayStudents,
    discountTypes,
    searchResults,
    selectedStudent: storeSelectedStudent,
    totalCount,
    currentPage,
    pageSize,
    loading,
    errors,
    isSearchMode,
    searchQuery,
    searchParams,
    setStudents,
    setDiscountTypes,
    addStudent,
    updateStudent: updateStudentInStore,
    deleteStudent: deleteStudentFromStore,
    setSelectedStudent: setStoreSelectedStudent,
    setLoadingState,
    setError,
    clearError,
    setSearchResults,
    setSearchQuery,
    setSearchParams,
    setSearchMode,
    setCurrentPage,
    setPageSize,
  } = useStudents();

  // Local UI state
  const [searchTerm, setSearchTermState] = useState('');
  const [statusFilter, setStatusFilterState] = useState<'all' | 'active' | 'inactive'>('all');
  const [teacherFilter, setTeacherFilterState] = useState<string>('all');
  const [discountFilter, setDiscountFilterState] = useState<'all' | 'with-discount' | 'no-discount'>('all');
  const [paymentFilter, setPaymentFilterState] = useState<'all' | 'has-obligations' | 'no-obligations'>('all');
  const [discountStatusFilter, setDiscountStatusFilterState] = useState<'all' | 'with-discount' | 'no-discount'>('all');
  const [discountTypeFilter, setDiscountTypeFilterState] = useState<'all' | string>('all');
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
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
    discountStatusFilter: 'all' as 'all' | 'with-discount' | 'no-discount',
    discountTypeFilter: 'all' as 'all' | string,
  });

  // Filtered students for local search (when not using API search)
  const filteredStudents = useMemo(() => {
    if (isSearchMode) {
      return searchResults || [];
    }
    
    if (!displayStudents) return [];
    
    return displayStudents.filter((student) => {
      if (!searchTerm && statusFilter === 'all' && teacherFilter === 'all' && discountFilter === 'all' && paymentFilter === 'all' && discountStatusFilter === 'all' && discountTypeFilter === 'all') return true;
      
      const matchesSearch = !searchTerm || (
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && student.isActive) ||
        (statusFilter === 'inactive' && !student.isActive);

      const matchesTeacher = teacherFilter === 'all' || 
        student.currentTeacherName === teachers.find(t => t.id === teacherFilter)?.name;

      const matchesDiscount = discountFilter === 'all' ||
        (discountFilter === 'with-discount' && student.hasDiscount) ||
        (discountFilter === 'no-discount' && !student.hasDiscount);

      // Payment filter: check frontend finance obligations
      const matchesPayment = paymentFilter === 'all' || (() => {
        // We'll need to get obligations from store in the component that uses this hook
        // For now, return true to not break filtering
        return true;
      })();

      const matchesDiscountStatus = discountStatusFilter === 'all' ||
        (discountStatusFilter === 'with-discount' && student.hasDiscount) ||
        (discountStatusFilter === 'no-discount' && !student.hasDiscount);

      const matchesDiscountType = discountTypeFilter === 'all' || 
        student.discountTypeId === discountTypeFilter;

      return matchesSearch && matchesStatus && matchesTeacher && matchesDiscount && matchesPayment && matchesDiscountStatus && matchesDiscountType;
    });
  }, [displayStudents, searchResults, searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter, discountStatusFilter, discountTypeFilter, isSearchMode, teachers]);

  // Load all students (loading handled by global interceptor)
  const loadStudents = useCallback(async () => {
    console.log('🔄 Loading students...');
    clearError('fetch');
    
    try {
      console.log('📡 Calling getAllStudents api...');
      const studentsData = await getAllStudents();
      console.log('✅ Students loaded successfully:', studentsData?.length || 0, 'students');
      setStudents(studentsData);
    } catch (error) {
      console.error('❌ Failed to load students:', error);
      const errorMessage = StudentErrorHandlers.fetchAll(error);
      setError('fetch', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Load all discount types (loading handled by global interceptor)
  const loadDiscountTypes = useCallback(async () => {
    console.log('🔄 Loading discount types...');
    clearError('fetchDiscountTypes');
    
    try {
      console.log('📡 Calling getAllDiscountTypes api...');
      const discountTypesData = await getAllDiscountTypes();
      console.log('✅ Discount types loaded successfully:', discountTypesData?.length || 0, 'types');
      setDiscountTypes(discountTypesData);
    } catch (error) {
      console.error('❌ Failed to load discount types:', error);
      const errorMessage = StudentErrorHandlers.fetchDiscountTypes(error);
      setError('fetchDiscountTypes', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Search students with API (no loading - search skips global loading)
  const searchStudentsApi = useCallback(async (params: StudentSearchParams) => {
    clearError('search');
    setSearchParams(params);
    
    try {
      const results = await searchStudents(params);
      setSearchResults({
        students: results.students,
        totalCount: results.totalCount,
        currentPage: Math.floor((params.skip || 0) / (params.take || 50)) + 1
      });
      setSearchMode(true);
    } catch (error) {
      const errorMessage = StudentErrorHandlers.search(error);
      setError('search', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Create student
  const createStudentApi = useCallback(async (data: StudentFormData) => {
    setLoadingState('creating', true);
    clearError('create');
    
    try {
      // Validate and prepare data
      const validation = validateAndPrepareStudentData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      
      const request = validation.data as CreateStudentRequest;
      const createdResponse = await createStudent(request);
      
      // Fetch the created student to get full data
      const createdStudent = await studentApiService.getStudentById(createdResponse.id);
      addStudent(createdStudent);

      showSuccessMessage(`Student Created`, `${data.firstName} ${data.lastName} has been successfully added to the system.`);
      return createdStudent;
    } catch (error) {
      const errorMessage = StudentErrorHandlers.create(error);
      setError('create', errorMessage);
      throw error;
    } finally {
      setLoadingState('creating', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Update student
  const updateStudentApi = useCallback(async (id: string, data: StudentFormData) => {
    setLoadingState('updating', true);
    clearError('update');
    
    try {
      // Validate and prepare data
      const validation = validateAndPrepareStudentData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      
      const request = validation.data as UpdateStudentRequest;
      const updatedStudent = await updateStudent(id, request);
      updateStudentInStore(updatedStudent);
      
      showSuccessMessage(`Student Updated`, `${data.firstName} ${data.lastName} has been successfully updated.`);
      return updatedStudent;
    } catch (error) {
      const errorMessage = StudentErrorHandlers.update(error);
      setError('update', errorMessage);
      throw error;
    } finally {
      setLoadingState('updating', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Delete student
  const deleteStudentApi = useCallback(async (id: string, name: string) => {
    setLoadingState('deleting', true);
    clearError('delete');
    
    try {
      await deleteStudent(id);
      deleteStudentFromStore(id);
      showSuccessMessage(`Student Deleted`, `${name} has been successfully removed from the system.`);
    } catch (error) {
      const errorMessage = StudentErrorHandlers.delete(error);
      setError('delete', errorMessage);
      throw error;
    } finally {
      setLoadingState('deleting', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // UI Handlers
  const handleAddStudent = useCallback(() => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  }, []);

  const handleEditStudent = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  }, []);

  const handleDeleteStudent = useCallback((student: Student) => {
    setStudentToDelete(student);
    setIsConfirmOpen(true);
  }, []);

  const handleViewStudent = useCallback((student: Student) => {
    setStoreSelectedStudent(student);
    // Could navigate to detail page here
    console.log('Viewing student:', student);
  }, [setStoreSelectedStudent]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleSubmit = useCallback(async (data: StudentFormData) => {
    if (selectedStudent) {
      await updateStudentApi(selectedStudent.id, data);
    } else {
      await createStudentApi(data);
    }
    handleCloseForm();
  }, [selectedStudent, updateStudentApi, createStudentApi, handleCloseForm]);

  const confirmDeleteStudent = useCallback(async () => {
    if (studentToDelete) {
      try {
        await deleteStudentApi(studentToDelete.id, studentToDelete.fullName);
        setStudentToDelete(null);
        setIsConfirmOpen(false);
      } catch (error) {
        // Error already handled by API function
      }
    }
  }, [studentToDelete, deleteStudentApi]);

  // Load teachers
  const loadTeachers = useCallback(async () => {
    try {
      const { getAllTeachers } = await import('@/services/teacherApiService');
      const teachersData = await getAllTeachers();
      setTeachers(teachersData.map(t => ({ id: t.id, name: t.name })));
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  }, []);

  // Check if any filters are active (computed early for use in effects)
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || teacherFilter !== 'all' || discountFilter !== 'all' || paymentFilter !== 'all' || discountStatusFilter !== 'all' || discountTypeFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchTermState('');
    setStatusFilterState('all');
    setTeacherFilterState('all');
    setDiscountFilterState('all');
    setPaymentFilterState('all');
    setDiscountStatusFilterState('all');
    setDiscountTypeFilterState('all');
    setSearchQuery('');
    setSearchMode(false);
    loadStudents();
  }, [loadStudents, setSearchQuery, setSearchMode]);

  // Simple setters that just update state (debounced effect handles the search)
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setSearchQuery(term);
  }, [setSearchQuery]);

  const setStatusFilter = useCallback((status: 'all' | 'active' | 'inactive') => {
    setStatusFilterState(status);
  }, []);

  const setTeacherFilter = useCallback((teacherId: string) => {
    setTeacherFilterState(teacherId);
  }, []);

  const setDiscountFilter = useCallback((status: 'all' | 'with-discount' | 'no-discount') => {
    setDiscountFilterState(status);
  }, []);

  const setPaymentFilter = useCallback((status: 'all' | 'has-obligations' | 'no-obligations') => {
    setPaymentFilterState(status);
  }, []);

  const setDiscountStatusFilter = useCallback((status: 'all' | 'with-discount' | 'no-discount') => {
    setDiscountStatusFilterState(status);
  }, []);

  const setDiscountTypeFilter = useCallback((typeId: 'all' | string) => {
    setDiscountTypeFilterState(typeId);
  }, []);

  // Debounced filter effect - triggers search only when filters actually change
  useEffect(() => {
    // Skip if not initialized yet to prevent duplicate initial load
    if (!isInitialized) return;

    // Check if filters actually changed
    const currentFilters = { searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter, discountStatusFilter, discountTypeFilter };
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFiltersRef.current);

    if (!filtersChanged) return;

    previousFiltersRef.current = currentFilters;

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search or exit search mode
    searchTimeoutRef.current = setTimeout(async () => {
      if (hasActiveFilters) {
        setIsSearching(true);
        const startTime = Date.now();

        try {
          const params: StudentSearchParams = {
            searchTerm: searchTerm.trim() || undefined,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            hasDiscount: discountFilter === 'all' ? undefined : discountFilter === 'with-discount',
            discountTypeId: discountTypeFilter === 'all' ? undefined : discountTypeFilter,
            teacherId: teacherFilter === 'all' ? undefined : teacherFilter,
            skip: 0,
            take: pageSize,
          };

          await searchStudentsApi(params);

          // Ensure minimum loading duration for better UX
          const elapsed = Date.now() - startTime;
          const minDuration = 500; // 500ms minimum
          if (elapsed < minDuration) {
            await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
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
  }, [searchTerm, statusFilter, teacherFilter, discountFilter, paymentFilter, discountStatusFilter, discountTypeFilter, isInitialized, hasActiveFilters, pageSize, searchStudentsApi, setSearchMode]);

  // Immediately exit search mode when no filters are active
  useEffect(() => {
    if (isInitialized && !hasActiveFilters && isSearchMode) {
      setSearchMode(false);
    }
  }, [isInitialized, hasActiveFilters, isSearchMode, setSearchMode]);

  const handleAdvancedSearch = useCallback((params: StudentSearchParams) => {
    searchStudentsApi(params);
  }, [searchStudentsApi]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    if (isSearchMode) {
      const params: StudentSearchParams = {
        ...searchParams,
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      searchStudentsApi(params);
    }
  }, [isSearchMode, searchParams, pageSize, searchStudentsApi, setCurrentPage]);

  // Auto-load students and discount types from API on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeStudents = async () => {
      console.log('🚀 StudentManagement hook mounted, initializing data...');
      
      // Disable global loading for all student operations to use page-specific loading states
      const { studentApiService } = await import('@/services/studentApiService');
      studentApiService
      
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

    initializeStudents();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    students: filteredStudents,
    discountTypes,
    searchResults,
    totalCount,
    currentPage,
    pageSize,
    isSearchMode,
    
    // Loading states (only form-related, global loading handled by interceptor)
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
    discountStatusFilter,
    discountTypeFilter,
    teachers,
    hasActiveFilters,
    searchParams,
    
    // View state
    viewMode,
    setViewMode,
    
    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedStudent,
    studentToDelete,
    
    // API functions
    loadStudents,
    loadDiscountTypes,
    createStudent: createStudentApi,
    updateStudent: updateStudentApi,
    deleteStudent: deleteStudentApi,
    searchStudents: searchStudentsApi,
    
    // UI handlers
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleViewStudent,
    handleCloseForm,
    handleSubmit,
    confirmDeleteStudent,
    clearFilters,
    handleAdvancedSearch,
    
    // Filter handlers
    setSearchTerm,
    setStatusFilter,
    setTeacherFilter,
    setDiscountFilter,
    setPaymentFilter,
    setDiscountStatusFilter,
    setDiscountTypeFilter,
    clearFilters,
    // Pagination handlers
    handlePageChange,
    setPageSize,
    
    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};

