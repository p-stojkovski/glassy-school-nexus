import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Teacher,
  setTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  setSelectedTeacher,
  setSubjects,
  setLoadingState,
  setAllLoading,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  resetTeachersState,
} from '../../teachersSlice';
import { TeacherSearchParams, SubjectDto } from '@/types/api/teacher';

export const useTeachers = () => {
  const dispatch = useAppDispatch();
  const teachersState = useAppSelector((state: RootState) => state.teachers);

  return {
    // Data
    teachers: teachersState.teachers,
    subjects: teachersState.subjects,
    searchResults: teachersState.searchResults,
    selectedTeacher: teachersState.selectedTeacher,

    // Display data (search results if in search mode, otherwise all teachers)
    displayTeachers: teachersState.isSearchMode
      ? teachersState.searchResults
      : teachersState.teachers,

    // Loading states
    loading: teachersState.loading,
    isLoading: Object.values(teachersState.loading).some(Boolean),

    // Error states
    errors: teachersState.errors,
    hasErrors: Object.values(teachersState.errors).some(Boolean),

    // Search state
    searchQuery: teachersState.searchQuery,
    searchParams: teachersState.searchParams,
    isSearchMode: teachersState.isSearchMode,

    // Actions - Data management
    setTeachers: (data: Teacher[]) => dispatch(setTeachers(data)),
    addTeacher: (data: Teacher) => dispatch(addTeacher(data)),
    updateTeacher: (data: Teacher) => dispatch(updateTeacher(data)),
    deleteTeacher: (id: string) => dispatch(deleteTeacher(id)),
    setSelectedTeacher: (teacher: Teacher | null) => dispatch(setSelectedTeacher(teacher)),

    // Actions - Subjects management
    setSubjects: (data: SubjectDto[]) => dispatch(setSubjects(data)),

    // Actions - Loading states
    setLoadingState: (operation: keyof typeof teachersState.loading, loading: boolean) =>
      dispatch(setLoadingState({ operation, loading })),
    setAllLoading: (loading: boolean) => dispatch(setAllLoading(loading)),

    // Actions - Error states
    setError: (operation: keyof typeof teachersState.errors, error: string | null) =>
      dispatch(setError({ operation, error })),
    clearError: (operation: keyof typeof teachersState.errors) => dispatch(clearError(operation)),
    clearAllErrors: () => dispatch(clearAllErrors()),

    // Actions - Search
    setSearchResults: (results: Teacher[]) => dispatch(setSearchResults(results)),
    setSearchQuery: (query: string) => dispatch(setSearchQuery(query)),
    setSearchParams: (params: TeacherSearchParams) => dispatch(setSearchParams(params)),
    setSearchMode: (isSearchMode: boolean) => dispatch(setSearchMode(isSearchMode)),

    // Actions - Reset
    resetState: () => dispatch(resetTeachersState()),
  };
};
