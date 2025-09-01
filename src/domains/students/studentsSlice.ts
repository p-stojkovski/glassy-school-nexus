import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudentResponse, DiscountTypeDto, StudentSearchParams } from '@/types/api/student';

// Use the API response type as our domain model
export type Student = StudentResponse;

// Loading states for different operations
export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
  fetchingDiscountTypes: boolean;
}

// Error states for different operations
export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
  fetchDiscountTypes: string | null;
}

interface StudentsState {
  // Data
  students: Student[];
  discountTypes: DiscountTypeDto[];
  searchResults: Student[];
  selectedStudent: Student | null;
  
  // Search metadata
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Loading states
  loading: LoadingStates;
  
  // Error states
  errors: ErrorStates;
  
  // Search and filter state
  searchQuery: string;
  searchParams: StudentSearchParams;
  isSearchMode: boolean;
}

const initialLoadingStates: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  fetchingDiscountTypes: false,
};

const initialErrorStates: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
  fetchDiscountTypes: null,
};

const initialState: StudentsState = {
  students: [],
  discountTypes: [],
  searchResults: [],
  selectedStudent: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,
  loading: initialLoadingStates,
  errors: initialErrorStates,
  searchQuery: '',
  searchParams: {},
  isSearchMode: false,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // Data management
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
      // Keep totalCount in sync when not searching
      if (!state.isSearchMode) {
        state.totalCount = state.students.length;
      }
      state.errors.fetch = null;
    },
    
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.unshift(action.payload);
      // Also update search results if in search mode
      if (state.isSearchMode) {
        state.searchResults.unshift(action.payload);
        state.totalCount += 1;
      } else {
        // Sync totalCount to actual number of students when not searching
        state.totalCount = state.students.length;
      }
    },
    
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
      
      // Also update in search results if present
      const searchIndex = state.searchResults.findIndex(s => s.id === action.payload.id);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = action.payload;
      }
      
      // Update selected student if it matches
      if (state.selectedStudent?.id === action.payload.id) {
        state.selectedStudent = action.payload;
      }
    },
    
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(s => s.id !== action.payload);
      state.searchResults = state.searchResults.filter(s => s.id !== action.payload);
      
      // Update total count depending on mode
      if (state.isSearchMode) {
        state.totalCount = Math.max(0, state.totalCount - 1);
      } else {
        state.totalCount = state.students.length;
      }
      
      // Clear selected student if it was deleted
      if (state.selectedStudent?.id === action.payload) {
        state.selectedStudent = null;
      }
    },
    
    setSelectedStudent: (state, action: PayloadAction<Student | null>) => {
      state.selectedStudent = action.payload;
    },

    // Discount Types management
    setDiscountTypes: (state, action: PayloadAction<DiscountTypeDto[]>) => {
      state.discountTypes = action.payload;
      state.errors.fetchDiscountTypes = null;
    },

    // Loading states
    setLoadingState: (state, action: PayloadAction<{ operation: keyof LoadingStates; loading: boolean }>) => {
      const { operation, loading } = action.payload;
      state.loading[operation] = loading;
    },
    
    setAllLoading: (state, action: PayloadAction<boolean>) => {
      Object.keys(state.loading).forEach(key => {
        (state.loading as any)[key] = action.payload;
      });
    },

    // Error states
    setError: (state, action: PayloadAction<{ operation: keyof ErrorStates; error: string | null }>) => {
      const { operation, error } = action.payload;
      state.errors[operation] = error;
    },
    
    clearError: (state, action: PayloadAction<keyof ErrorStates>) => {
      state.errors[action.payload] = null;
    },
    
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        (state.errors as any)[key] = null;
      });
    },

    // Search functionality
    setSearchResults: (state, action: PayloadAction<{ students: Student[]; totalCount: number; currentPage: number }>) => {
      const { students, totalCount, currentPage } = action.payload;
      state.searchResults = students;
      state.totalCount = totalCount;
      state.currentPage = currentPage;
      state.errors.search = null;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSearchParams: (state, action: PayloadAction<StudentSearchParams>) => {
      state.searchParams = action.payload;
    },
    
    setSearchMode: (state, action: PayloadAction<boolean>) => {
      state.isSearchMode = action.payload;
      if (!action.payload) {
        state.searchResults = [];
        state.searchQuery = '';
        state.searchParams = {};
        // When leaving search mode, reflect actual number of students
        state.totalCount = state.students.length;
        state.currentPage = 1;
      }
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },

    // Reset state
    resetStudentsState: (state) => {
      return initialState;
    },
    
    // Legacy support for existing components
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.fetching = action.payload;
    },
  },
});

export const {
  // Data management
  setStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  setSelectedStudent,
  
  // Discount Types management
  setDiscountTypes,
  
  // Loading states
  setLoadingState,
  setAllLoading,
  
  // Error states
  clearError,
  clearAllErrors,
  
  // Search functionality
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  
  // Pagination
  setCurrentPage,
  setPageSize,
  
  // Reset
  resetStudentsState,
  
  // Legacy support (will be removed)
  setLoading,
  setError,
} = studentsSlice.actions;

// Modern selectors
export const selectStudents = (state: { students: StudentsState }) => state.students.students;
export const selectDiscountTypes = (state: { students: StudentsState }) => state.students.discountTypes;
export const selectSearchResults = (state: { students: StudentsState }) => state.students.searchResults;
export const selectSelectedStudent = (state: { students: StudentsState }) => state.students.selectedStudent;
export const selectTotalCount = (state: { students: StudentsState }) => state.students.totalCount;
export const selectCurrentPage = (state: { students: StudentsState }) => state.students.currentPage;
export const selectPageSize = (state: { students: StudentsState }) => state.students.pageSize;
export const selectLoadingStates = (state: { students: StudentsState }) => state.students.loading;
export const selectErrorStates = (state: { students: StudentsState }) => state.students.errors;
export const selectSearchQuery = (state: { students: StudentsState }) => state.students.searchQuery;
export const selectSearchParams = (state: { students: StudentsState }) => state.students.searchParams;
export const selectIsSearchMode = (state: { students: StudentsState }) => state.students.isSearchMode;

// Display data selector (search results if in search mode, otherwise all students)
export const selectDisplayStudents = (state: { students: StudentsState }) => 
  state.students.isSearchMode ? state.students.searchResults : state.students.students;

// Legacy selectors (for backward compatibility)
export const selectLoading = (state: { students: StudentsState }) => state.students.loading.fetching;
export const selectError = (state: { students: StudentsState }) => state.students.errors.fetch;
export const selectStudentById = (state: { students: StudentsState }, studentId: string) =>
  state.students.students.find(student => student.id === studentId) || 
  state.students.searchResults.find(student => student.id === studentId);

export default studentsSlice.reducer;
