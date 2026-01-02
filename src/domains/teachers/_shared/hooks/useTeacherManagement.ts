import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTeachers } from './useTeachers';
import { Teacher } from '../../teachersSlice';
import {
  teacherApiService,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
  getAllSubjects,
} from '@/services/teacherApiService';
import {
  showSuccessMessage,
  TeacherErrorHandlers,
} from '@/utils/apiErrorHandler';
import {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherSearchParams,
} from '@/types/api/teacher';
import {
  validateAndPrepareTeacherData,
} from '@/utils/validation/teacherValidators';
import { clearCache } from '@/utils/cacheManager';

export type TeacherViewMode = 'grid' | 'table';

export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  subjectId: string;
  notes?: string;
}

export const useTeacherManagement = () => {
  const {
    displayTeachers,
    subjects,
    searchResults,
    selectedTeacher: storeSelectedTeacher,
    loading,
    errors,
    isSearchMode,
    searchQuery,
    searchParams,
    setTeachers,
    setSubjects,
    addTeacher,
    updateTeacher: updateTeacherInStore,
    deleteTeacher: deleteTeacherFromStore,
    setSelectedTeacher: setStoreSelectedTeacher,
    setLoadingState,
    setError,
    clearError,
    setSearchResults,
    setSearchQuery,
    setSearchParams,
    setSearchMode,
  } = useTeachers();

  // Local UI state
  const [searchTerm, setSearchTermState] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<'all' | '0-2' | '3-5' | '5+'>('all');
  const [viewMode, setViewMode] = useState<TeacherViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Calculate years of experience from joinDate
  const calculateExperience = useCallback((joinDate: string): number => {
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const monthDiff = now.getMonth() - join.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && now.getDate() < join.getDate()) ? years - 1 : years;
  }, []);

  // Apply local filters to teachers
  const filteredTeachers = useMemo(() => {
    if (isSearchMode) {
      return searchResults || [];
    }

    let filtered = displayTeachers;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => statusFilter === 'active' ? t.isActive : !t.isActive);
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(t => t.subjectId === subjectFilter);
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(t => {
        const years = calculateExperience(t.joinDate);
        if (experienceFilter === '0-2') return years >= 0 && years <= 2;
        if (experienceFilter === '3-5') return years >= 3 && years <= 5;
        if (experienceFilter === '5+') return years > 5;
        return true;
      });
    }

    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [displayTeachers, searchResults, isSearchMode, statusFilter, subjectFilter, experienceFilter, searchTerm, calculateExperience]);

  // Load all teachers with optional filters (loading handled by global interceptor)
  const loadTeachers = useCallback(async (params?: TeacherSearchParams) => {
    clearError('fetch');

    try {
      const teachersData = await getAllTeachers(params);
      setTeachers(teachersData);

      // If we have filters, set search mode
      if (params && (params.searchTerm || params.subjectId)) {
        setSearchMode(true);
      } else {
        setSearchMode(false);
      }
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.fetchAll(error);
      setError('fetch', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Load all subjects (loading handled by global interceptor)
  const loadSubjects = useCallback(async () => {
    clearError('fetchSubjects');

    try {
      const subjectsData = await getAllSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.fetchSubjects(error);
      setError('fetchSubjects', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Search teachers with API (no loading - search skips global loading)
  const searchTeachersApi = useCallback(async (params: TeacherSearchParams) => {
    clearError('search');
    setSearchParams(params);

    try {
      const results = await searchTeachers(
        params.searchTerm,
        params.subjectId
      );
      setSearchResults(results);
      setSearchMode(true);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.search(error);
      setError('search', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Create teacher
  const createTeacherApi = useCallback(async (data: TeacherFormData) => {
    setLoadingState('creating', true);
    clearError('create');

    try {
      // Validate and prepare data
      const validation = validateAndPrepareTeacherData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }

      const request = validation.data as CreateTeacherRequest;
      const createdResponse = await createTeacher(request);

      // Fetch the created teacher to get full data
      const createdTeacher = await teacherApiService.getTeacherById(createdResponse.id);
      addTeacher(createdTeacher);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Created`, `${data.name} has been successfully added to the system.`);
      return createdTeacher;
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.create(error);
      setError('create', errorMessage);
      throw error;
    } finally {
      setLoadingState('creating', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Update teacher
  const updateTeacherApi = useCallback(async (id: string, data: TeacherFormData) => {
    setLoadingState('updating', true);
    clearError('update');

    try {
      // Validate and prepare data
      const validation = validateAndPrepareTeacherData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }

      const request = validation.data as UpdateTeacherRequest;
      const updatedTeacher = await updateTeacher(id, request);
      updateTeacherInStore(updatedTeacher);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Updated`, `${data.name} has been successfully updated.`);
      return updatedTeacher;
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.update(error);
      setError('update', errorMessage);
      throw error;
    } finally {
      setLoadingState('updating', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Delete teacher
  const deleteTeacherApi = useCallback(async (id: string, name: string) => {
    setLoadingState('deleting', true);
    clearError('delete');

    try {
      await deleteTeacher(id);
      deleteTeacherFromStore(id);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Deleted`, `${name} has been successfully removed from the system.`);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.delete(error);
      setError('delete', errorMessage);
      throw error;
    } finally {
      setLoadingState('deleting', false);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // UI Handlers
  const handleAddTeacher = useCallback(() => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTeacher = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  }, []);

  const handleDeleteTeacher = useCallback((teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsConfirmOpen(true);
  }, []);

  const handleViewTeacher = useCallback((teacher: Teacher) => {
    setStoreSelectedTeacher(teacher);
    // Could navigate to detail page here
    console.log('Viewing teacher:', teacher);
  }, [setStoreSelectedTeacher]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
  }, []);

  const handleSubmit = useCallback(async (data: TeacherFormData) => {
    if (selectedTeacher) {
      await updateTeacherApi(selectedTeacher.id, data);
    } else {
      await createTeacherApi(data);
    }
    handleCloseForm();
  }, [selectedTeacher, updateTeacherApi, createTeacherApi, handleCloseForm]);

  const confirmDeleteTeacher = useCallback(async () => {
    if (teacherToDelete) {
      try {
        await deleteTeacherApi(teacherToDelete.id, teacherToDelete.name);
        setTeacherToDelete(null);
        setIsConfirmOpen(false);
      } catch (error) {
        // Error already handled by API function
      }
    }
  }, [teacherToDelete, deleteTeacherApi]);

  const clearFilters = useCallback(() => {
    setSearchTermState('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setExperienceFilter('all');
    setSearchQuery('');
    setSearchMode(false);
    // Reload all teachers without filters
    loadTeachers();
  }, [loadTeachers, setSearchQuery, setSearchMode]); // Redux dispatch functions are stable, no dependencies needed

  // Wrapper for setSearchTerm to update both local state and Redux
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setSearchQuery(term);
  }, [setSearchQuery]);

  // Filter handlers - now using loadTeachers with params
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);

    // Call loadTeachers with filters
    const params: TeacherSearchParams = {
      searchTerm: term.trim() || undefined,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined
    };

    // If no filters active, load all teachers
    if (!params.searchTerm && !params.subjectId) {
      loadTeachers();
    } else {
      loadTeachers(params);
    }
  }, [subjectFilter, loadTeachers]); // Keep only necessary dependencies

  const handleSubjectFilterChange = useCallback((subjectId: string) => {
    setSubjectFilter(subjectId);

    // Call loadTeachers with filters
    const params: TeacherSearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      subjectId: subjectId !== 'all' ? subjectId : undefined
    };

    // If no filters active, load all teachers
    if (!params.searchTerm && !params.subjectId) {
      loadTeachers();
    } else {
      loadTeachers(params);
    }
  }, [searchTerm, loadTeachers]); // Keep only necessary dependencies

  const handleAdvancedSearch = useCallback((params: TeacherSearchParams) => {
    searchTeachersApi(params);
  }, [searchTeachersApi]);

  // Auto-load teachers and subjects from API on mount
  useEffect(() => {
    let mounted = true;

    const initializeTeachers = async () => {
      console.log('🚀 TeacherManagement hook mounted, initializing data...');

      // Disable global loading for all teacher operations to use page-specific loading states
      const { teacherApiService } = await import('@/services/teacherApiService');

      try {
        await Promise.all([loadTeachers(), loadSubjects()]);
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize teachers:', error);
        if (mounted) {
          setIsInitialized(true); // Still mark as initialized to show error state
        }
      }
    };

    initializeTeachers();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || subjectFilter !== 'all' || experienceFilter !== 'all';

  // Pagination
  const totalCount = filteredTeachers.length;
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(startIndex, startIndex + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, subjectFilter, experienceFilter, searchTerm]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    // Data
    teachers: paginatedTeachers,
    allTeachers: displayTeachers,
    subjects,
    filteredTeachers,
    searchResults,
    isSearchMode,
    totalCount,
    currentPage,
    pageSize,

    // Loading states (only form-related, global loading handled by interceptor)
    loading,
    isLoading: loading.creating || loading.updating || loading.deleting,
    isInitialized,

    // Error states
    errors,

    // Filter state
    searchTerm,
    statusFilter,
    subjectFilter,
    experienceFilter,
    hasActiveFilters,
    searchParams,

    // View state
    viewMode,
    setViewMode,

    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedTeacher,
    teacherToDelete,

    // API functions
    loadTeachers,
    loadSubjects,
    createTeacher: createTeacherApi,
    updateTeacher: updateTeacherApi,
    deleteTeacher: deleteTeacherApi,
    searchTeachers: searchTeachersApi,

    // UI handlers
    handleAddTeacher,
    handleEditTeacher,
    handleDeleteTeacher,
    handleViewTeacher,
    handleCloseForm,
    handleSubmit,
    confirmDeleteTeacher,
    clearFilters,
    handleSearchChange,
    handleAdvancedSearch,
    handlePageChange,

    // Filter handlers
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setExperienceFilter,

    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};
