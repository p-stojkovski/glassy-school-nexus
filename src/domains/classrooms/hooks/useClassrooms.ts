import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Classroom,
  setClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  setSelectedClassroom,
  setLoadingState,
  setAllLoading,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  setNameAvailability,
  clearNameAvailability,
  resetClassroomsState,
} from '../classroomsSlice';
import { ClassroomSearchParams } from '@/types/api/classroom';

export const useClassrooms = () => {
  const dispatch = useAppDispatch();
  const classroomsState = useAppSelector((state: RootState) => state.classrooms);
  
  return {
    // Data
    classrooms: classroomsState.classrooms,
    searchResults: classroomsState.searchResults,
    selectedClassroom: classroomsState.selectedClassroom,
    
    // Display data (search results if in search mode, otherwise all classrooms)
    displayClassrooms: classroomsState.isSearchMode 
      ? classroomsState.searchResults 
      : classroomsState.classrooms,
    
    // Loading states
    loading: classroomsState.loading,
    isLoading: Object.values(classroomsState.loading).some(Boolean),
    
    // Error states
    errors: classroomsState.errors,
    hasErrors: Object.values(classroomsState.errors).some(Boolean),
    
    // Search state
    searchQuery: classroomsState.searchQuery,
    searchParams: classroomsState.searchParams,
    isSearchMode: classroomsState.isSearchMode,
    
    // Name availability
    nameAvailability: classroomsState.nameAvailability,
    
    // Actions - Data management
    setClassrooms: (data: Classroom[]) => dispatch(setClassrooms(data)),
    addClassroom: (data: Classroom) => dispatch(addClassroom(data)),
    updateClassroom: (data: Classroom) => dispatch(updateClassroom(data)),
    deleteClassroom: (id: string) => dispatch(deleteClassroom(id)),
    setSelectedClassroom: (classroom: Classroom | null) => dispatch(setSelectedClassroom(classroom)),
    
    // Actions - Loading states
    setLoadingState: (operation: keyof typeof classroomsState.loading, loading: boolean) =>
      dispatch(setLoadingState({ operation, loading })),
    setAllLoading: (loading: boolean) => dispatch(setAllLoading(loading)),
    
    // Actions - Error states
    setError: (operation: keyof typeof classroomsState.errors, error: string | null) =>
      dispatch(setError({ operation, error })),
    clearError: (operation: keyof typeof classroomsState.errors) => dispatch(clearError(operation)),
    clearAllErrors: () => dispatch(clearAllErrors()),
    
    // Actions - Search
    setSearchResults: (results: Classroom[]) => dispatch(setSearchResults(results)),
    setSearchQuery: (query: string) => dispatch(setSearchQuery(query)),
    setSearchParams: (params: ClassroomSearchParams) => dispatch(setSearchParams(params)),
    setSearchMode: (isSearchMode: boolean) => dispatch(setSearchMode(isSearchMode)),
    
    // Actions - Name availability
    setNameAvailability: (name: string, isAvailable: boolean, isChecking: boolean, error: string | null) =>
      dispatch(setNameAvailability({ name, isAvailable, isChecking, error })),
    clearNameAvailability: (name: string) => dispatch(clearNameAvailability(name)),
    
    // Actions - Reset
    resetState: () => dispatch(resetClassroomsState()),
  };
};
