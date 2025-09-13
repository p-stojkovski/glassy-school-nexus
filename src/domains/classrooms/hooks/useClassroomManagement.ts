import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useClassrooms } from './useClassrooms';
import { Classroom } from '../classroomsSlice';
import { 
  classroomApiService,
  getAllClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  searchClassrooms,
  checkNameAvailability,
} from '@/services/classroomApiService';
import { 
  showSuccessMessage, 
  ClassroomErrorHandlers,
} from '@/utils/apiErrorHandler';
import { 
  CreateClassroomRequest,
  UpdateClassroomRequest,
  ClassroomSearchParams,
  ClassroomValidationRules,
} from '@/types/api/classroom';
import {
  validateAndPrepareClassroomData,
} from '@/utils/validation/classroomValidators';
import { clearCache } from '@/utils/cacheManager';

export interface ClassroomFormData {
  name: string;
  location?: string;
  capacity: number;
}

export const useClassroomManagement = () => {
  const {
    displayClassrooms,
    searchResults,
    selectedClassroom: storeSelectedClassroom,
    loading,
    errors,
    isSearchMode,
    searchQuery,
    searchParams,
    nameAvailability,
    setClassrooms,
    addClassroom,
    updateClassroom: updateClassroomInStore,
    deleteClassroom: deleteClassroomFromStore,
    setSelectedClassroom: setStoreSelectedClassroom,
    setLoadingState,
    setError,
    clearError,
    setSearchResults,
    setSearchQuery,
    setSearchParams,
    setSearchMode,
    setNameAvailability,
  } = useClassrooms();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  
// Track ongoing availability checks to prevent duplicates without causing re-renders
  const ongoingChecksRef = useRef<Set<string>>(new Set());

  // Track the last completed check key to avoid repeating the same value
  const lastCheckedKeyRef = useRef<string | null>(null);
  // Keep a stable reference to the setter to avoid changing callback identity
  const setNameAvailabilityRef = useRef(setNameAvailability);
  useEffect(() => {
    setNameAvailabilityRef.current = setNameAvailability;
  }, [setNameAvailability]);

  // Filtered classrooms for local search
  const filteredClassrooms = useMemo(() => {
    if (isSearchMode) {
      return searchResults;
    }
    
    return displayClassrooms.filter((classroom) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        classroom.name.toLowerCase().includes(term) ||
        classroom.location?.toLowerCase().includes(term) ||
        false
      );
    });
  }, [displayClassrooms, searchResults, searchTerm, isSearchMode]);

  // Load all classrooms
  const loadClassrooms = useCallback(async () => {
    clearError('fetch');
    
    try {
      const classroomsData = await getAllClassrooms();
      setClassrooms(classroomsData);
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.fetchAll(error);
      setError('fetch', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

  // Search classrooms with API
  const searchClassroomsApi = useCallback(async (params: ClassroomSearchParams) => {
    clearError('search');
    setSearchParams(params);
    
    try {
      const results = await searchClassrooms(
        params.searchTerm
      );
      setSearchResults(results);
      setSearchMode(true);
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.search(error);
      setError('search', errorMessage);
    }
  }, []); // Redux dispatch functions are stable, no dependencies needed

// Check name availability with debouncing and stable identity
  const checkNameAvailabilityApi = useCallback(async (name: string, excludeId?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Guard: only check when meets minimum length
    if (trimmedName.length < ClassroomValidationRules.NAME.MIN_LENGTH) return;

    const checkKey = `${trimmedName}-${excludeId || 'new'}`;

    // Avoid duplicate concurrent checks and repeat of the last completed check
    if (ongoingChecksRef.current.has(checkKey) || lastCheckedKeyRef.current === checkKey) {
      return;
    }

    ongoingChecksRef.current.add(checkKey);
    setNameAvailabilityRef.current(trimmedName, false, true, null);

    try {
      const isAvailable = await checkNameAvailability(trimmedName, excludeId);
      setNameAvailabilityRef.current(trimmedName, isAvailable, false, null);
      lastCheckedKeyRef.current = checkKey;
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.checkName(error);
      setNameAvailabilityRef.current(trimmedName, false, false, errorMessage);
      lastCheckedKeyRef.current = checkKey;
    } finally {
      ongoingChecksRef.current.delete(checkKey);
    }
  }, []);

  // Create classroom
  const createClassroomApi = useCallback(async (data: ClassroomFormData) => {
    clearError('create');
    
    try {
      // Validate and prepare data
      const validation = validateAndPrepareClassroomData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      
      const request = validation.data as CreateClassroomRequest;
      const createdResponse = await createClassroom(request);
      
      // Fetch the created classroom to get full data
      const createdClassroom = await classroomApiService.getClassroomById(createdResponse.id);
      addClassroom(createdClassroom);
      
      // Clear localStorage items that depend on classrooms data
      localStorage.removeItem('think-english-classrooms');

      showSuccessMessage(`Classroom Created`, `${data.name} has been successfully created.`);
      return createdClassroom;
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.create(error);
      setError('create', errorMessage);
      throw error;
    }
  }, [clearError, addClassroom, setError]);

  // Update classroom
  const updateClassroomApi = useCallback(async (id: string, data: ClassroomFormData) => {
    clearError('update');
    
    try {
      // Validate and prepare data
      const validation = validateAndPrepareClassroomData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }
      
      const request = validation.data as UpdateClassroomRequest;
      const updatedClassroom = await updateClassroom(id, request);
      updateClassroomInStore(updatedClassroom);
      
      // Clear localStorage items that depend on classrooms data
      localStorage.removeItem('think-english-classrooms');
      localStorage.removeItem('think-english-subjects');
      localStorage.removeItem('think-english-teachers');
      clearCache('classrooms');
      
      showSuccessMessage(`Classroom Updated`, `${data.name} has been successfully updated.`);
      return updatedClassroom;
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.update(error);
      setError('update', errorMessage);
      throw error;
    }
  }, [clearError, updateClassroomInStore, setError]);

  // Delete classroom
  const deleteClassroomApi = useCallback(async (id: string, name: string) => {
    clearError('delete');
    
    try {
      await deleteClassroom(id);
      deleteClassroomFromStore(id);
      
      // Clear localStorage items that depend on classrooms data
      localStorage.removeItem('think-english-classrooms');
      localStorage.removeItem('think-english-subjects');
      localStorage.removeItem('think-english-teachers');
      clearCache('classrooms');
      
      showSuccessMessage(`Classroom Deleted`, `${name} has been successfully deleted.`);
    } catch (error) {
      const errorMessage = ClassroomErrorHandlers.delete(error);
      setError('delete', errorMessage);
      throw error;
    }
  }, [clearError, deleteClassroomFromStore, setError]);

  // UI Handlers
  const handleAddClassroom = useCallback(() => {
    setSelectedClassroom(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClassroom = useCallback((classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClassroom = useCallback((classroom: Classroom) => {
    setClassroomToDelete(classroom);
    setIsConfirmOpen(true);
  }, []);

  const handleViewClassroom = useCallback((classroom: Classroom) => {
    setStoreSelectedClassroom(classroom);
    // Could navigate to detail page here
    console.log('Viewing classroom:', classroom);
  }, [setStoreSelectedClassroom]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedClassroom(null);
  }, []);

  const handleSubmit = useCallback(async (data: ClassroomFormData) => {
    try {
      if (selectedClassroom) {
        await updateClassroomApi(selectedClassroom.id, data);
      } else {
        await createClassroomApi(data);
      }
      handleCloseForm();
    } catch (error) {
      // Error already handled by API functions
    }
  }, [selectedClassroom, updateClassroomApi, createClassroomApi, handleCloseForm]);

  const confirmDeleteClassroom = useCallback(async () => {
    if (classroomToDelete) {
      try {
        await deleteClassroomApi(classroomToDelete.id, classroomToDelete.name);
        setClassroomToDelete(null);
        setIsConfirmOpen(false);
      } catch (error) {
        // Error already handled by API function
      }
    }
  }, [classroomToDelete, deleteClassroomApi]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSearchQuery('');
    setSearchMode(false);
  }, [setSearchQuery, setSearchMode]);

  // Search handling
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
    
    // If term is empty, exit search mode
    if (!term.trim()) {
      setSearchMode(false);
    }
  }, [setSearchQuery, setSearchMode]);

  const handleAdvancedSearch = useCallback((params: ClassroomSearchParams) => {
    searchClassroomsApi(params);
  }, [searchClassroomsApi]);

  // Auto-load classrooms from API on mount
  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  return {
    // Data
    classrooms: displayClassrooms,
    filteredClassrooms,
    searchResults,
    isSearchMode,
    
    // Loading states
    loading,
    isLoading: loading.fetching || loading.creating || loading.updating || loading.deleting,
    
    // Error states
    errors,
    
    // Search state
    searchTerm,
    searchParams,
    nameAvailability,
    
    // UI state
    isFormOpen,
    isConfirmOpen,
    selectedClassroom,
    classroomToDelete,
    
    // API functions
    loadClassrooms,
    createClassroom: createClassroomApi,
    updateClassroom: updateClassroomApi,
    deleteClassroom: deleteClassroomApi,
    searchClassrooms: searchClassroomsApi,
    checkNameAvailability: checkNameAvailabilityApi,
    
    // UI handlers
    handleAddClassroom,
    handleEditClassroom,
    handleDeleteClassroom,
    handleViewClassroom,
    handleCloseForm,
    handleSubmit,
    confirmDeleteClassroom,
    clearFilters,
    handleSearchChange,
    handleAdvancedSearch,
    
    // State setters
    setIsFormOpen,
    setIsConfirmOpen,
    setSearchTerm: handleSearchChange,
  };
};

