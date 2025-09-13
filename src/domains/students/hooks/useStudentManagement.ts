import { useState, useMemo, useCallback, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [discountStatusFilter, setDiscountStatusFilter] = useState<'all' | 'with-discount' | 'no-discount'>('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<StudentViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filtered students for local search (when not using API search)
  const filteredStudents = useMemo(() => {
    if (isSearchMode) {
      return searchResults;
    }
    
    return displayStudents.filter((student) => {
      if (!searchTerm && statusFilter === 'all' && discountStatusFilter === 'all' && discountTypeFilter === 'all') return true;
      
      const matchesSearch = !searchTerm || (
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && student.isActive) ||
        (statusFilter === 'inactive' && !student.isActive);

      const matchesDiscountStatus = discountStatusFilter === 'all' ||
        (discountStatusFilter === 'with-discount' && student.hasDiscount) ||
        (discountStatusFilter === 'no-discount' && !student.hasDiscount);

      const matchesDiscountType = discountTypeFilter === 'all' || 
        student.discountTypeId === discountTypeFilter;

      return matchesSearch && matchesStatus && matchesDiscountStatus && matchesDiscountType;
    });
  }, [displayStudents, searchResults, searchTerm, statusFilter, discountStatusFilter, discountTypeFilter, isSearchMode]);

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

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setDiscountStatusFilter('all');
    setDiscountTypeFilter('all');
    setSearchQuery('');
    setSearchMode(false);
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Filter handlers with API integration
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
    
    // Build search params
    const params: StudentSearchParams = {
      searchTerm: term.trim() || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      hasDiscount: discountStatusFilter === 'all' ? undefined : discountStatusFilter === 'with-discount',
      discountTypeId: discountTypeFilter === 'all' ? undefined : discountTypeFilter,
      skip: 0,
      take: pageSize,
    };

    // If any filter is active, trigger API search
    if (term.trim() || statusFilter !== 'all' || discountStatusFilter !== 'all' || discountTypeFilter !== 'all') {
      searchStudentsApi(params);
    } else {
      setSearchMode(false);
    }
  }, [statusFilter, discountStatusFilter, discountTypeFilter, pageSize, searchStudentsApi]);

  const handleStatusFilterChange = useCallback((status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    
    // Build search params
    const params: StudentSearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      isActive: status === 'all' ? undefined : status === 'active',
      hasDiscount: discountStatusFilter === 'all' ? undefined : discountStatusFilter === 'with-discount',
      discountTypeId: discountTypeFilter === 'all' ? undefined : discountTypeFilter,
      skip: 0,
      take: pageSize,
    };

    // If any filter is active, trigger API search
    if (searchTerm.trim() || status !== 'all' || discountStatusFilter !== 'all' || discountTypeFilter !== 'all') {
      searchStudentsApi(params);
    } else {
      setSearchMode(false);
    }
  }, [searchTerm, discountStatusFilter, discountTypeFilter, pageSize, searchStudentsApi]);

  const handleDiscountStatusFilterChange = useCallback((discountStatus: 'all' | 'with-discount' | 'no-discount') => {
    setDiscountStatusFilter(discountStatus);
    
    // Build search params
    const params: StudentSearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      hasDiscount: discountStatus === 'all' ? undefined : discountStatus === 'with-discount',
      discountTypeId: discountTypeFilter === 'all' ? undefined : discountTypeFilter,
      skip: 0,
      take: pageSize,
    };

    // If any filter is active, trigger API search
    if (searchTerm.trim() || statusFilter !== 'all' || discountStatus !== 'all' || discountTypeFilter !== 'all') {
      searchStudentsApi(params);
    } else {
      setSearchMode(false);
    }
  }, [searchTerm, statusFilter, discountTypeFilter, pageSize, searchStudentsApi]);

  const handleDiscountTypeFilterChange = useCallback((typeId: 'all' | string) => {
    setDiscountTypeFilter(typeId);
    
    // Build search params
    const params: StudentSearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      hasDiscount: discountStatusFilter === 'all' ? undefined : discountStatusFilter === 'with-discount',
      discountTypeId: typeId === 'all' ? undefined : typeId,
      skip: 0,
      take: pageSize,
    };

    // If any filter is active, trigger API search
    if (searchTerm.trim() || statusFilter !== 'all' || discountStatusFilter !== 'all' || typeId !== 'all') {
      searchStudentsApi(params);
    } else {
      setSearchMode(false);
    }
  }, [searchTerm, statusFilter, discountStatusFilter, pageSize, searchStudentsApi]);

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
        await Promise.all([loadStudents(), loadDiscountTypes()]);
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

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || discountStatusFilter !== 'all' || discountTypeFilter !== 'all';

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
    isInitialized,
    
    // Error states
    errors,
    
    // Filter state
    searchTerm,
    statusFilter,
    discountStatusFilter,
    discountTypeFilter,
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
    handleSearchChange,
    handleAdvancedSearch,
    
    // Filter handlers
    setSearchTerm: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,
    setDiscountStatusFilter: handleDiscountStatusFilterChange,
    setDiscountTypeFilter: handleDiscountTypeFilterChange,
    
    // Pagination handlers
    handlePageChange,
    setPageSize,
    
    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};

