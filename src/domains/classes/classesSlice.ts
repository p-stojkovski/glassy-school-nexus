import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClassResponse, ClassListItemResponse } from '@/types/api/class';
import { ClassSearchParams } from '@/types/api/class';
import { ClassSalaryRule, ClassSalaryPreview } from './_shared/types/salaryRule.types';

/** Lightweight class item for list/search views */
export type ClassListItem = ClassListItemResponse;

/** Full class details for detail views (kept for backward compatibility) */
export type ClassItem = ClassResponse;

export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  searching: boolean;
  fetchingSalaryRules: boolean;
  creatingSalaryRule: boolean;
  updatingSalaryRule: boolean;
  deletingSalaryRule: boolean;
  fetchingSalaryPreview: boolean;
}

export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
  fetchSalaryRules: string | null;
  createSalaryRule: string | null;
  updateSalaryRule: string | null;
  deleteSalaryRule: string | null;
  fetchSalaryPreview: string | null;
}

interface ClassesState {
  /** Lightweight class items for list view */
  classes: ClassListItem[];
  /** Lightweight class items for search results */
  searchResults: ClassListItem[];
  /** Full class details for detail view */
  selectedClass: ClassItem | null;
  loading: LoadingStates;
  errors: ErrorStates;
  searchQuery: string;
  searchParams: ClassSearchParams;
  isSearchMode: boolean;
  salaryRules: {
    items: ClassSalaryRule[];
  };
  salaryPreview: {
    data: ClassSalaryPreview | null;
  };
}

const initialLoading: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  fetchingSalaryRules: false,
  creatingSalaryRule: false,
  updatingSalaryRule: false,
  deletingSalaryRule: false,
  fetchingSalaryPreview: false,
};

const initialErrors: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
  fetchSalaryRules: null,
  createSalaryRule: null,
  updateSalaryRule: null,
  deleteSalaryRule: null,
  fetchSalaryPreview: null,
};

const initialState: ClassesState = {
  classes: [],
  searchResults: [],
  selectedClass: null,
  loading: initialLoading,
  errors: initialErrors,
  searchQuery: '',
  searchParams: {},
  isSearchMode: false,
  salaryRules: {
    items: [],
  },
  salaryPreview: {
    data: null,
  },
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    // data
    setClasses(state, action: PayloadAction<ClassListItem[]>) {
      state.classes = action.payload;
      state.errors.fetch = null;
    },
    addClass(state, action: PayloadAction<ClassListItem>) {
      state.classes.unshift(action.payload);
      if (state.isSearchMode) {
        state.searchResults.unshift(action.payload);
      }
    },
    updateClassInList(state, action: PayloadAction<ClassListItem>) {
      const idx = state.classes.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.classes[idx] = action.payload;
      const sidx = state.searchResults.findIndex(c => c.id === action.payload.id);
      if (sidx !== -1) state.searchResults[sidx] = action.payload;
    },
    /** Update the selected class detail */
    updateSelectedClass(state, action: PayloadAction<ClassItem>) {
      if (state.selectedClass?.id === action.payload.id) {
        state.selectedClass = action.payload;
      }
    },
    disableClass(state, action: PayloadAction<string>) {
      const idx = state.classes.findIndex(c => c.id === action.payload);
      if (idx !== -1) {
        state.classes[idx] = { ...state.classes[idx], isActive: false };
      }
      const sidx = state.searchResults.findIndex(c => c.id === action.payload);
      if (sidx !== -1) {
        state.searchResults[sidx] = { ...state.searchResults[sidx], isActive: false };
      }
      if (state.selectedClass?.id === action.payload) {
        state.selectedClass = { ...state.selectedClass, isActive: false };
      }
    },
    enableClass(state, action: PayloadAction<string>) {
      const idx = state.classes.findIndex(c => c.id === action.payload);
      if (idx !== -1) {
        state.classes[idx] = { ...state.classes[idx], isActive: true };
      }
      const sidx = state.searchResults.findIndex(c => c.id === action.payload);
      if (sidx !== -1) {
        state.searchResults[sidx] = { ...state.searchResults[sidx], isActive: true };
      }
      if (state.selectedClass?.id === action.payload) {
        state.selectedClass = { ...state.selectedClass, isActive: true };
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
      (Object.keys(state.errors) as Array<keyof ErrorStates>).forEach(k => {
        state.errors[k] = null;
      });
    },

    // search
    setSearchResults(state, action: PayloadAction<ClassListItem[]>) {
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

    // salary rules
    setSalaryRules(state, action: PayloadAction<ClassSalaryRule[]>) {
      state.salaryRules.items = action.payload;
      state.errors.fetchSalaryRules = null;
    },
    addSalaryRule(state, action: PayloadAction<ClassSalaryRule>) {
      state.salaryRules.items.push(action.payload);
      state.errors.createSalaryRule = null;
    },
    updateSalaryRule(state, action: PayloadAction<ClassSalaryRule>) {
      const idx = state.salaryRules.items.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) {
        state.salaryRules.items[idx] = action.payload;
      }
      state.errors.updateSalaryRule = null;
    },
    removeSalaryRule(state, action: PayloadAction<string>) {
      state.salaryRules.items = state.salaryRules.items.filter(r => r.id !== action.payload);
      state.errors.deleteSalaryRule = null;
    },
    setSalaryPreview(state, action: PayloadAction<ClassSalaryPreview | null>) {
      state.salaryPreview.data = action.payload;
      state.errors.fetchSalaryPreview = null;
    },
    clearSalaryRules(state) {
      state.salaryRules.items = [];
    },
    clearSalaryPreview(state) {
      state.salaryPreview.data = null;
    },

    resetClassesState: () => initialState,
  },
});

export const {
  setClasses,
  addClass,
  updateClassInList,
  updateSelectedClass,
  disableClass,
  enableClass,
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
  setSalaryRules,
  addSalaryRule,
  updateSalaryRule,
  removeSalaryRule,
  setSalaryPreview,
  clearSalaryRules,
  clearSalaryPreview,
  resetClassesState,
} = classesSlice.actions;

// Selectors
/** Returns lightweight class items for list view */
export const selectClasses = (state: { classes: ClassesState }): ClassListItem[] => state.classes.classes;
/** Returns lightweight class items from search */
export const selectSearchResults = (state: { classes: ClassesState }): ClassListItem[] => state.classes.searchResults;
/** Returns full class details for the selected class */
export const selectSelectedClass = (state: { classes: ClassesState }): ClassItem | null => state.classes.selectedClass;
export const selectLoading = (state: { classes: ClassesState }) => state.classes.loading;
export const selectErrors = (state: { classes: ClassesState }) => state.classes.errors;
export const selectSearchQuery = (state: { classes: ClassesState }) => state.classes.searchQuery;
export const selectSearchParams = (state: { classes: ClassesState }) => state.classes.searchParams;
export const selectIsSearchMode = (state: { classes: ClassesState }) => state.classes.isSearchMode;
export const selectSalaryRules = (state: { classes: ClassesState }) => state.classes.salaryRules.items;
export const selectSalaryPreview = (state: { classes: ClassesState }) => state.classes.salaryPreview.data;

/** Display data selector (search results if in search mode, otherwise all classes) - returns lightweight items */
export const selectDisplayClasses = (state: { classes: ClassesState }): ClassListItem[] =>
  state.classes.isSearchMode ? state.classes.searchResults : state.classes.classes;

export default classesSlice.reducer;
