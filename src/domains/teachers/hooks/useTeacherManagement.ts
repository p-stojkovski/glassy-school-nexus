import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTeachers } from './useTeachers';
import { Teacher } from '../teachersSlice';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<TeacherViewMode>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Filtered teachers for local search
  const filteredTeachers = useMemo(() => {
    if (isSearchMode) {
      return searchResults;
    }
    
    return displayTeachers.filter((teacher) => {
      if (!searchTerm && subjectFilter === 'all') return true;
      
      const matchesSearch = !searchTerm || (
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesSubject = subjectFilter === 'all' || teacher.subjectId === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [displayTeachers, searchResults, searchTerm, subjectFilter, isSearchMode]);

  // Load all teachers (loading handled by global interceptor)
  const loadTeachers = useCallback(async () => {
    clearError('fetch');
    
    try {
      const teachersData = await getAllTeachers();
      setTeachers(teachersData);
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
    setSearchTerm('');
    setSubjectFilter('all');
    setSearchQuery('');
    setSearchMode(false);
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Filter handlers
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
    
    // If term is empty and no subject filter, exit search mode
    if (!term.trim() && subjectFilter === 'all') {
      setSearchMode(false);
    } else if (term.trim() || subjectFilter !== 'all') {
      // If there's a search term or subject filter, trigger API search
      const params: TeacherSearchParams = {
        searchTerm: term.trim() || undefined,
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined
      };
      searchTeachersApi(params);
    }
  }, [subjectFilter, searchTeachersApi]); // Keep only necessary dependencies
  
  const handleSubjectFilterChange = useCallback((subjectId: string) => {
    setSubjectFilter(subjectId);
    
    // If a specific subject is selected or search term exists, trigger API search
    if (subjectId !== 'all' || searchTerm.trim()) {
      const params: TeacherSearchParams = {
        searchTerm: searchTerm.trim() || undefined,
        subjectId: subjectId !== 'all' ? subjectId : undefined
      };
      searchTeachersApi(params);
    } else {
      // If all filters are cleared, exit search mode
      setSearchMode(false);
    }
  }, [searchTerm, searchTeachersApi]); // Keep only necessary dependencies

  const handleAdvancedSearch = useCallback((params: TeacherSearchParams) => {
    searchTeachersApi(params);
  }, [searchTeachersApi]);

  // Auto-load teachers and subjects from API on mount
  useEffect(() => {
    loadTeachers();
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || subjectFilter !== 'all';

  return {
    // Data
    teachers: displayTeachers,
    subjects,
    filteredTeachers,
    searchResults,
    isSearchMode,
    
    // Loading states (only form-related, global loading handled by interceptor)
    loading,
    isLoading: loading.creating || loading.updating || loading.deleting,
    
    // Error states
    errors,
    
    // Filter state
    searchTerm,
    subjectFilter,
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
    
    // Filter handlers
    setSearchTerm: handleSearchChange,
    setSubjectFilter: handleSubjectFilterChange,
    
    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
  };
};
