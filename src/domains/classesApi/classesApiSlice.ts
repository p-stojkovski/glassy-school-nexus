import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClassResponse } from '@/types/api/class';
import { ClassSearchParams } from '@/types/api/class';

export type ClassItem = ClassResponse;

export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
}

export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
}

interface ClassesApiState {
  classes: ClassItem[];
  searchResults: ClassItem[];
  selectedClass: ClassItem | null;
  loading: LoadingStates;
  errors: ErrorStates;
  searchQuery: string;
  searchParams: ClassSearchParams;
  isSearchMode: boolean;
}

const initialLoading: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
};

const initialErrors: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
};

const initialState: ClassesApiState = {
  classes: [],
  searchResults: [],
  selectedClass: null,
  loading: initialLoading,
  errors: initialErrors,
  searchQuery: '',
  searchParams: {},
  isSearchMode: false,
};

const classesApiSlice = createSlice({
  name: 'classesApi',
  initialState,
  reducers: {
    // data
    setClasses(state, action: PayloadAction<ClassItem[]>) {
      state.classes = action.payload;
      state.errors.fetch = null;
    },
    addClass(state, action: PayloadAction<ClassItem>) {
      state.classes.unshift(action.payload);
      if (state.isSearchMode) {
        state.searchResults.unshift(action.payload);
      }
    },
    updateClass(state, action: PayloadAction<ClassItem>) {
      const idx = state.classes.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.classes[idx] = action.payload;
      const sidx = state.searchResults.findIndex(c => c.id === action.payload.id);
      if (sidx !== -1) state.searchResults[sidx] = action.payload;
      if (state.selectedClass?.id === action.payload.id) {
        state.selectedClass = action.payload;
      }
    },
    deleteClass(state, action: PayloadAction<string>) {
      state.classes = state.classes.filter(c => c.id !== action.payload);
      state.searchResults = state.searchResults.filter(c => c.id !== action.payload);
      if (state.selectedClass?.id === action.payload) {
        state.selectedClass = null;
      }
    },
    setSelectedClass(state, action: PayloadAction<ClassItem | null>) {
      state.selectedClass = action.payload;
    },

    // loading
    setLoadingState(state, action: PayloadAction<{ operation: keyof LoadingStates; loading: boolean }>) {
      const { operation, loading } = action.payload;
      state.loading[operation] = loading;
    },

    // errors
    setError(state, action: PayloadAction<{ operation: keyof ErrorStates; error: string | null }>) {
      const { operation, error } = action.payload;
      state.errors[operation] = error;
    },
    clearError(state, action: PayloadAction<keyof ErrorStates>) {
      state.errors[action.payload] = null;
    },
    clearAllErrors(state) {
      Object.keys(state.errors).forEach(k => (state.errors as any)[k] = null);
    },

    // search
    setSearchResults(state, action: PayloadAction<ClassItem[]>) {
      state.searchResults = action.payload;
      state.errors.search = null;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSearchParams(state, action: PayloadAction<ClassSearchParams>) {
      state.searchParams = action.payload;
    },
    setSearchMode(state, action: PayloadAction<boolean>) {
      state.isSearchMode = action.payload;
      if (!action.payload) {
        state.searchResults = [];
        state.searchQuery = '';
        state.searchParams = {};
      }
    },
    resetClassesApiState: () => initialState,
  },
});

export const {
  setClasses,
  addClass,
  updateClass,
  deleteClass,
  setSelectedClass,
  setLoadingState,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
  resetClassesApiState,
} = classesApiSlice.actions;

export default classesApiSlice.reducer;
