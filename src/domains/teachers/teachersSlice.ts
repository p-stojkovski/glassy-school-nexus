import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TeacherResponse, SubjectDto, TeacherSearchParams } from '@/types/api/teacher';

// Use the API response type as our domain model
export type Teacher = TeacherResponse;

// Loading states for different operations
export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
  fetchingSubjects: boolean;
}

// Error states for different operations
export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
  fetchSubjects: string | null;
}

interface TeachersState {
  // Data
  teachers: Teacher[];
  subjects: SubjectDto[];
  searchResults: Teacher[];
  selectedTeacher: Teacher | null;
  
  // Loading states
  loading: LoadingStates;
  
  // Error states
  errors: ErrorStates;
  
  // Search and filter state
  searchQuery: string;
  searchParams: TeacherSearchParams;
  isSearchMode: boolean;
}

const initialLoadingStates: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  fetchingSubjects: false,
};

const initialErrorStates: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
  fetchSubjects: null,
};

const initialState: TeachersState = {
  teachers: [],
  subjects: [],
  searchResults: [],
  selectedTeacher: null,
  loading: initialLoadingStates,
  errors: initialErrorStates,
  searchQuery: '',
  searchParams: {},
  isSearchMode: false,
};

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    // Data management
    setTeachers: (state, action: PayloadAction<Teacher[]>) => {
      state.teachers = action.payload;
      state.errors.fetch = null;
    },
    
    addTeacher: (state, action: PayloadAction<Teacher>) => {
      state.teachers.unshift(action.payload);
      // Also update search results if in search mode
      if (state.isSearchMode) {
        state.searchResults.unshift(action.payload);
      }
    },
    
    updateTeacher: (state, action: PayloadAction<Teacher>) => {
      const index = state.teachers.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = action.payload;
      }
      
      // Also update in search results if present
      const searchIndex = state.searchResults.findIndex(t => t.id === action.payload.id);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = action.payload;
      }
      
      // Update selected teacher if it matches
      if (state.selectedTeacher?.id === action.payload.id) {
        state.selectedTeacher = action.payload;
      }
    },
    
    deleteTeacher: (state, action: PayloadAction<string>) => {
      state.teachers = state.teachers.filter(t => t.id !== action.payload);
      state.searchResults = state.searchResults.filter(t => t.id !== action.payload);
      
      // Clear selected teacher if it was deleted
      if (state.selectedTeacher?.id === action.payload) {
        state.selectedTeacher = null;
      }
    },
    
    setSelectedTeacher: (state, action: PayloadAction<Teacher | null>) => {
      state.selectedTeacher = action.payload;
    },

    // Subjects management
    setSubjects: (state, action: PayloadAction<SubjectDto[]>) => {
      state.subjects = action.payload;
      state.errors.fetchSubjects = null;
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
    setSearchResults: (state, action: PayloadAction<Teacher[]>) => {
      state.searchResults = action.payload;
      state.errors.search = null;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSearchParams: (state, action: PayloadAction<TeacherSearchParams>) => {
      state.searchParams = action.payload;
    },
    
    setSearchMode: (state, action: PayloadAction<boolean>) => {
      state.isSearchMode = action.payload;
      if (!action.payload) {
        state.searchResults = [];
        state.searchQuery = '';
        state.searchParams = {};
      }
    },

    // Reset state
    resetTeachersState: (state) => {
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
  setTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  setSelectedTeacher,
  
  // Subjects management
  setSubjects,
  
  // Loading states
  setLoadingState,
  setAllLoading,
  
  // Error states
  setError,
  clearError,
  clearAllErrors,
  
  // Search functionality
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  
  // Reset
  resetTeachersState,
  
  // Legacy support
  setLoading,
} = teachersSlice.actions;

export default teachersSlice.reducer;
