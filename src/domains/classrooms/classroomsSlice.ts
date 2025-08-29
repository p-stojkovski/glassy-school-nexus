import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClassroomResponse, ClassroomSearchParams } from '@/types/api/classroom';

// Use the API response type as our domain model
export type Classroom = ClassroomResponse;

// Loading states for different operations
export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
  checkingName: boolean;
}

// Error states for different operations
export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
  checkName: string | null;
}

interface ClassroomsState {
  // Data
  classrooms: Classroom[];
  searchResults: Classroom[];
  selectedClassroom: Classroom | null;
  
  // Loading states
  loading: LoadingStates;
  
  // Error states
  errors: ErrorStates;
  
  // Search and filter state
  searchQuery: string;
  searchParams: ClassroomSearchParams;
  isSearchMode: boolean;
  
  // Name availability checking
  nameAvailability: {
    [name: string]: {
      isAvailable: boolean;
      isChecking: boolean;
      error: string | null;
    };
  };
}

const initialLoadingStates: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  checkingName: false,
};

const initialErrorStates: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
  checkName: null,
};

const initialState: ClassroomsState = {
  classrooms: [],
  searchResults: [],
  selectedClassroom: null,
  loading: initialLoadingStates,
  errors: initialErrorStates,
  searchQuery: '',
  searchParams: {},
  isSearchMode: false,
  nameAvailability: {},
};

const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    // Data management
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      state.errors.fetch = null;
    },
    
    addClassroom: (state, action: PayloadAction<Classroom>) => {
      state.classrooms.unshift(action.payload);
      // Also update search results if in search mode
      if (state.isSearchMode) {
        state.searchResults.unshift(action.payload);
      }
    },
    
    updateClassroom: (state, action: PayloadAction<Classroom>) => {
      const index = state.classrooms.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classrooms[index] = action.payload;
      }
      
      // Also update in search results if present
      const searchIndex = state.searchResults.findIndex(c => c.id === action.payload.id);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = action.payload;
      }
      
      // Update selected classroom if it matches
      if (state.selectedClassroom?.id === action.payload.id) {
        state.selectedClassroom = action.payload;
      }
    },
    
    deleteClassroom: (state, action: PayloadAction<string>) => {
      state.classrooms = state.classrooms.filter(c => c.id !== action.payload);
      state.searchResults = state.searchResults.filter(c => c.id !== action.payload);
      
      // Clear selected classroom if it was deleted
      if (state.selectedClassroom?.id === action.payload) {
        state.selectedClassroom = null;
      }
    },
    
    setSelectedClassroom: (state, action: PayloadAction<Classroom | null>) => {
      state.selectedClassroom = action.payload;
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
    setSearchResults: (state, action: PayloadAction<Classroom[]>) => {
      state.searchResults = action.payload;
      state.errors.search = null;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSearchParams: (state, action: PayloadAction<ClassroomSearchParams>) => {
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

    // Name availability checking
    setNameAvailability: (state, action: PayloadAction<{
      name: string;
      isAvailable: boolean;
      isChecking: boolean;
      error: string | null;
    }>) => {
      const { name, isAvailable, isChecking, error } = action.payload;
      state.nameAvailability[name] = { isAvailable, isChecking, error };
    },
    
    clearNameAvailability: (state, action: PayloadAction<string>) => {
      delete state.nameAvailability[action.payload];
    },
    
    clearAllNameAvailability: (state) => {
      state.nameAvailability = {};
    },

    // Reset state
    resetClassroomsState: (state) => {
      return initialState;
    },
  },
});

export const {
  // Data management
  setClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  setSelectedClassroom,
  
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
  
  // Name availability
  setNameAvailability,
  clearNameAvailability,
  clearAllNameAvailability,
  
  // Reset
  resetClassroomsState,
} = classroomsSlice.actions;

export default classroomsSlice.reducer;
