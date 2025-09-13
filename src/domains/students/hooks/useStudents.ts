import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Student,
  setStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  setSelectedStudent,
  setDiscountTypes,
  setLoadingState,
  setAllLoading,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  setCurrentPage,
  setPageSize,
  resetStudentsState,
} from '../studentsSlice';
import { StudentSearchParams, DiscountTypeDto } from '@/types/api/student';

export const useStudents = () => {
  const dispatch = useAppDispatch();
  const studentsState = useAppSelector((state: RootState) => state.students);
  
  return {
    // Data
    students: studentsState.students,
    discountTypes: studentsState.discountTypes,
    searchResults: studentsState.searchResults,
    selectedStudent: studentsState.selectedStudent,
    
    // Search metadata
    totalCount: studentsState.totalCount,
    currentPage: studentsState.currentPage,
    pageSize: studentsState.pageSize,
    
    // Display data (search results if in search mode, otherwise all students)
    displayStudents: studentsState.isSearchMode 
      ? studentsState.searchResults 
      : studentsState.students,
    
    // Loading states
    loading: studentsState.loading,
    isLoading: Object.values(studentsState.loading).some(Boolean),
    
    // Error states
    errors: studentsState.errors,
    hasErrors: Object.values(studentsState.errors).some(Boolean),
    
    // Search state
    searchQuery: studentsState.searchQuery,
    searchParams: studentsState.searchParams,
    isSearchMode: studentsState.isSearchMode,
    
    // Actions - Data management
    setStudents: (data: Student[]) => dispatch(setStudents(data)),
    addStudent: (data: Student) => dispatch(addStudent(data)),
    updateStudent: (data: Student) => dispatch(updateStudent(data)),
    deleteStudent: (id: string) => dispatch(deleteStudent(id)),
    setSelectedStudent: (student: Student | null) => dispatch(setSelectedStudent(student)),
    
    // Actions - Discount Types management
    setDiscountTypes: (data: DiscountTypeDto[]) => dispatch(setDiscountTypes(data)),
    
    // Actions - Loading states
    setLoadingState: (operation: keyof typeof studentsState.loading, loading: boolean) =>
      dispatch(setLoadingState({ operation, loading })),
    setAllLoading: (loading: boolean) => dispatch(setAllLoading(loading)),
    
    // Actions - Error states
    setError: (operation: keyof typeof studentsState.errors, error: string | null) =>
      dispatch(setError({ operation, error })),
    clearError: (operation: keyof typeof studentsState.errors) => dispatch(clearError(operation)),
    clearAllErrors: () => dispatch(clearAllErrors()),
    
    // Actions - Search
    setSearchResults: (data: { students: Student[]; totalCount: number; currentPage: number }) => 
      dispatch(setSearchResults(data)),
    setSearchQuery: (query: string) => dispatch(setSearchQuery(query)),
    setSearchParams: (params: StudentSearchParams) => dispatch(setSearchParams(params)),
    setSearchMode: (isSearchMode: boolean) => dispatch(setSearchMode(isSearchMode)),
    
    // Actions - Pagination
    setCurrentPage: (page: number) => dispatch(setCurrentPage(page)),
    setPageSize: (size: number) => dispatch(setPageSize(size)),
    
    // Actions - Reset
    resetState: () => dispatch(resetStudentsState()),
  };
};

