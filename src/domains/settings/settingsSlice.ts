import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Subject } from './types/subjectTypes';
import type { DiscountType } from './types/discountTypeTypes';
import type { LessonStatus } from './types/lessonStatusTypes';
import type { AcademicYear, Semester, TeachingBreak } from './types/academicCalendarTypes';
import type { RootState } from '@/store';

// Loading state interfaces
interface SubjectsLoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

interface SubjectsErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
}

interface DiscountTypesLoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

interface DiscountTypesErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
}

interface LessonStatusesLoadingStates {
  fetching: boolean;
  updating: boolean;
}

interface LessonStatusesErrorStates {
  fetch: string | null;
  update: string | null;
}

interface AcademicCalendarLoadingStates {
  fetchingYears: boolean;
  creatingYear: boolean;
  updatingYear: boolean;
  deletingYear: boolean;
  fetchingSemesters: boolean;
  creatingSemester: boolean;
  updatingSemester: boolean;
  deletingSemester: boolean;
  fetchingBreaks: boolean;
  creatingBreak: boolean;
  updatingBreak: boolean;
  deletingBreak: boolean;
}

interface AcademicCalendarErrorStates {
  fetchYears: string | null;
  createYear: string | null;
  updateYear: string | null;
  deleteYear: string | null;
  fetchSemesters: string | null;
  createSemester: string | null;
  updateSemester: string | null;
  deleteSemester: string | null;
  fetchBreaks: string | null;
  createBreak: string | null;
  updateBreak: string | null;
  deleteBreak: string | null;
}

// Main state interface
interface SettingsState {
  subjects: {
    items: Subject[];
    loading: SubjectsLoadingStates;
    errors: SubjectsErrorStates;
  };
  discountTypes: {
    items: DiscountType[];
    loading: DiscountTypesLoadingStates;
    errors: DiscountTypesErrorStates;
  };
  lessonStatuses: {
    items: LessonStatus[];
    loading: LessonStatusesLoadingStates;
    errors: LessonStatusesErrorStates;
  };
  academicCalendar: {
    academicYears: AcademicYear[];
    semesters: Record<string, Semester[]>;
    teachingBreaks: Record<string, TeachingBreak[]>;
    activeAcademicYearId: string | null;
    loading: AcademicCalendarLoadingStates;
    errors: AcademicCalendarErrorStates;
  };
}

// Initial states
const initialSubjectsLoading: SubjectsLoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
};

const initialSubjectsErrors: SubjectsErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
};

const initialDiscountTypesLoading: DiscountTypesLoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
};

const initialDiscountTypesErrors: DiscountTypesErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
};

const initialLessonStatusesLoading: LessonStatusesLoadingStates = {
  fetching: false,
  updating: false,
};

const initialLessonStatusesErrors: LessonStatusesErrorStates = {
  fetch: null,
  update: null,
};

const initialAcademicCalendarLoading: AcademicCalendarLoadingStates = {
  fetchingYears: false,
  creatingYear: false,
  updatingYear: false,
  deletingYear: false,
  fetchingSemesters: false,
  creatingSemester: false,
  updatingSemester: false,
  deletingSemester: false,
  fetchingBreaks: false,
  creatingBreak: false,
  updatingBreak: false,
  deletingBreak: false,
};

const initialAcademicCalendarErrors: AcademicCalendarErrorStates = {
  fetchYears: null,
  createYear: null,
  updateYear: null,
  deleteYear: null,
  fetchSemesters: null,
  createSemester: null,
  updateSemester: null,
  deleteSemester: null,
  fetchBreaks: null,
  createBreak: null,
  updateBreak: null,
  deleteBreak: null,
};

const initialState: SettingsState = {
  subjects: {
    items: [],
    loading: initialSubjectsLoading,
    errors: initialSubjectsErrors,
  },
  discountTypes: {
    items: [],
    loading: initialDiscountTypesLoading,
    errors: initialDiscountTypesErrors,
  },
  lessonStatuses: {
    items: [],
    loading: initialLessonStatusesLoading,
    errors: initialLessonStatusesErrors,
  },
  academicCalendar: {
    academicYears: [],
    semesters: {},
    teachingBreaks: {},
    activeAcademicYearId: null,
    loading: initialAcademicCalendarLoading,
    errors: initialAcademicCalendarErrors,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // ==================== Subjects ====================
    setSubjects(state, action: PayloadAction<Subject[]>) {
      state.subjects.items = action.payload;
      state.subjects.errors.fetch = null;
    },
    addSubject(state, action: PayloadAction<Subject>) {
      state.subjects.items.push(action.payload);
      state.subjects.errors.create = null;
    },
    updateSubject(state, action: PayloadAction<Subject>) {
      const idx = state.subjects.items.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) {
        state.subjects.items[idx] = action.payload;
      }
      state.subjects.errors.update = null;
    },
    removeSubject(state, action: PayloadAction<number>) {
      state.subjects.items = state.subjects.items.filter(s => s.id !== action.payload);
      state.subjects.errors.delete = null;
    },
    setSubjectsLoading(state, action: PayloadAction<{ operation: keyof SubjectsLoadingStates; loading: boolean }>) {
      state.subjects.loading[action.payload.operation] = action.payload.loading;
    },
    setSubjectsError(state, action: PayloadAction<{ operation: keyof SubjectsErrorStates; error: string | null }>) {
      state.subjects.errors[action.payload.operation] = action.payload.error;
    },
    clearSubjectsErrors(state) {
      state.subjects.errors = initialSubjectsErrors;
    },

    // ==================== Discount Types ====================
    setDiscountTypes(state, action: PayloadAction<DiscountType[]>) {
      state.discountTypes.items = action.payload;
      state.discountTypes.errors.fetch = null;
    },
    addDiscountType(state, action: PayloadAction<DiscountType>) {
      state.discountTypes.items.push(action.payload);
      state.discountTypes.errors.create = null;
    },
    updateDiscountType(state, action: PayloadAction<DiscountType>) {
      const idx = state.discountTypes.items.findIndex(d => d.id === action.payload.id);
      if (idx !== -1) {
        state.discountTypes.items[idx] = action.payload;
      }
      state.discountTypes.errors.update = null;
    },
    removeDiscountType(state, action: PayloadAction<number>) {
      state.discountTypes.items = state.discountTypes.items.filter(d => d.id !== action.payload);
      state.discountTypes.errors.delete = null;
    },
    setDiscountTypesLoading(state, action: PayloadAction<{ operation: keyof DiscountTypesLoadingStates; loading: boolean }>) {
      state.discountTypes.loading[action.payload.operation] = action.payload.loading;
    },
    setDiscountTypesError(state, action: PayloadAction<{ operation: keyof DiscountTypesErrorStates; error: string | null }>) {
      state.discountTypes.errors[action.payload.operation] = action.payload.error;
    },
    clearDiscountTypesErrors(state) {
      state.discountTypes.errors = initialDiscountTypesErrors;
    },

    // ==================== Lesson Statuses ====================
    setLessonStatuses(state, action: PayloadAction<LessonStatus[]>) {
      state.lessonStatuses.items = action.payload;
      state.lessonStatuses.errors.fetch = null;
    },
    updateLessonStatus(state, action: PayloadAction<LessonStatus>) {
      const idx = state.lessonStatuses.items.findIndex(ls => ls.id === action.payload.id);
      if (idx !== -1) {
        state.lessonStatuses.items[idx] = action.payload;
      }
      state.lessonStatuses.errors.update = null;
    },
    setLessonStatusesLoading(state, action: PayloadAction<{ operation: keyof LessonStatusesLoadingStates; loading: boolean }>) {
      state.lessonStatuses.loading[action.payload.operation] = action.payload.loading;
    },
    setLessonStatusesError(state, action: PayloadAction<{ operation: keyof LessonStatusesErrorStates; error: string | null }>) {
      state.lessonStatuses.errors[action.payload.operation] = action.payload.error;
    },
    clearLessonStatusesErrors(state) {
      state.lessonStatuses.errors = initialLessonStatusesErrors;
    },

    // ==================== Academic Calendar - Years ====================
    setAcademicYears(state, action: PayloadAction<AcademicYear[]>) {
      state.academicCalendar.academicYears = action.payload;
      const activeYear = action.payload.find(y => y.isActive);
      state.academicCalendar.activeAcademicYearId = activeYear?.id ?? null;
      state.academicCalendar.errors.fetchYears = null;
    },
    addAcademicYear(state, action: PayloadAction<AcademicYear>) {
      state.academicCalendar.academicYears.push(action.payload);
      if (action.payload.isActive) {
        state.academicCalendar.academicYears.forEach(y => {
          if (y.id !== action.payload.id) y.isActive = false;
        });
        state.academicCalendar.activeAcademicYearId = action.payload.id;
      }
      state.academicCalendar.errors.createYear = null;
    },
    updateAcademicYear(state, action: PayloadAction<AcademicYear>) {
      const idx = state.academicCalendar.academicYears.findIndex(y => y.id === action.payload.id);
      if (idx !== -1) {
        state.academicCalendar.academicYears[idx] = action.payload;
      }
      if (action.payload.isActive) {
        state.academicCalendar.academicYears.forEach(y => {
          if (y.id !== action.payload.id) y.isActive = false;
        });
        state.academicCalendar.activeAcademicYearId = action.payload.id;
      } else if (state.academicCalendar.activeAcademicYearId === action.payload.id) {
        state.academicCalendar.activeAcademicYearId = null;
      }
      state.academicCalendar.errors.updateYear = null;
    },
    removeAcademicYear(state, action: PayloadAction<string>) {
      state.academicCalendar.academicYears = state.academicCalendar.academicYears.filter(y => y.id !== action.payload);
      delete state.academicCalendar.semesters[action.payload];
      delete state.academicCalendar.teachingBreaks[action.payload];
      if (state.academicCalendar.activeAcademicYearId === action.payload) {
        state.academicCalendar.activeAcademicYearId = null;
      }
      state.academicCalendar.errors.deleteYear = null;
    },

    // ==================== Academic Calendar - Semesters ====================
    setSemesters(state, action: PayloadAction<{ yearId: string; semesters: Semester[] }>) {
      state.academicCalendar.semesters[action.payload.yearId] = action.payload.semesters;
      state.academicCalendar.errors.fetchSemesters = null;
    },
    addSemester(state, action: PayloadAction<Semester>) {
      const yearId = action.payload.academicYearId;
      if (!state.academicCalendar.semesters[yearId]) {
        state.academicCalendar.semesters[yearId] = [];
      }
      state.academicCalendar.semesters[yearId].push(action.payload);
      state.academicCalendar.errors.createSemester = null;
    },
    updateSemester(state, action: PayloadAction<Semester>) {
      const yearId = action.payload.academicYearId;
      if (state.academicCalendar.semesters[yearId]) {
        const idx = state.academicCalendar.semesters[yearId].findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.academicCalendar.semesters[yearId][idx] = action.payload;
        }
      }
      state.academicCalendar.errors.updateSemester = null;
    },
    removeSemester(state, action: PayloadAction<{ yearId: string; semesterId: string }>) {
      const { yearId, semesterId } = action.payload;
      if (state.academicCalendar.semesters[yearId]) {
        state.academicCalendar.semesters[yearId] = state.academicCalendar.semesters[yearId].filter(s => s.id !== semesterId);
      }
      state.academicCalendar.errors.deleteSemester = null;
    },

    // ==================== Academic Calendar - Teaching Breaks ====================
    setTeachingBreaks(state, action: PayloadAction<{ yearId: string; breaks: TeachingBreak[] }>) {
      state.academicCalendar.teachingBreaks[action.payload.yearId] = action.payload.breaks;
      state.academicCalendar.errors.fetchBreaks = null;
    },
    addTeachingBreak(state, action: PayloadAction<TeachingBreak>) {
      const yearId = action.payload.academicYearId;
      if (!state.academicCalendar.teachingBreaks[yearId]) {
        state.academicCalendar.teachingBreaks[yearId] = [];
      }
      state.academicCalendar.teachingBreaks[yearId].push(action.payload);
      state.academicCalendar.errors.createBreak = null;
    },
    updateTeachingBreak(state, action: PayloadAction<TeachingBreak>) {
      const yearId = action.payload.academicYearId;
      if (state.academicCalendar.teachingBreaks[yearId]) {
        const idx = state.academicCalendar.teachingBreaks[yearId].findIndex(b => b.id === action.payload.id);
        if (idx !== -1) {
          state.academicCalendar.teachingBreaks[yearId][idx] = action.payload;
        }
      }
      state.academicCalendar.errors.updateBreak = null;
    },
    removeTeachingBreak(state, action: PayloadAction<{ yearId: string; breakId: string }>) {
      const { yearId, breakId } = action.payload;
      if (state.academicCalendar.teachingBreaks[yearId]) {
        state.academicCalendar.teachingBreaks[yearId] = state.academicCalendar.teachingBreaks[yearId].filter(b => b.id !== breakId);
      }
      state.academicCalendar.errors.deleteBreak = null;
    },

    // ==================== Academic Calendar - Loading & Errors ====================
    setAcademicCalendarLoading(state, action: PayloadAction<{ operation: keyof AcademicCalendarLoadingStates; loading: boolean }>) {
      state.academicCalendar.loading[action.payload.operation] = action.payload.loading;
    },
    setAcademicCalendarError(state, action: PayloadAction<{ operation: keyof AcademicCalendarErrorStates; error: string | null }>) {
      state.academicCalendar.errors[action.payload.operation] = action.payload.error;
    },
    clearAcademicCalendarErrors(state) {
      state.academicCalendar.errors = initialAcademicCalendarErrors;
    },

    // ==================== Global Reset ====================
    resetSettingsState: () => initialState,
  },
});

export const {
  // Subjects
  setSubjects,
  addSubject,
  updateSubject,
  removeSubject,
  setSubjectsLoading,
  setSubjectsError,
  clearSubjectsErrors,
  // Discount Types
  setDiscountTypes,
  addDiscountType,
  updateDiscountType,
  removeDiscountType,
  setDiscountTypesLoading,
  setDiscountTypesError,
  clearDiscountTypesErrors,
  // Lesson Statuses
  setLessonStatuses,
  updateLessonStatus,
  setLessonStatusesLoading,
  setLessonStatusesError,
  clearLessonStatusesErrors,
  // Academic Calendar - Years
  setAcademicYears,
  addAcademicYear,
  updateAcademicYear,
  removeAcademicYear,
  // Academic Calendar - Semesters
  setSemesters,
  addSemester,
  updateSemester,
  removeSemester,
  // Academic Calendar - Teaching Breaks
  setTeachingBreaks,
  addTeachingBreak,
  updateTeachingBreak,
  removeTeachingBreak,
  // Academic Calendar - Loading & Errors
  setAcademicCalendarLoading,
  setAcademicCalendarError,
  clearAcademicCalendarErrors,
  // Global
  resetSettingsState,
} = settingsSlice.actions;

// ==================== Typed Selectors ====================

// Subjects selectors
export const selectSubjects = (state: RootState): Subject[] => state.settings.subjects.items;
export const selectSubjectsLoading = (state: RootState) => state.settings.subjects.loading;
export const selectSubjectsErrors = (state: RootState) => state.settings.subjects.errors;

// Discount Types selectors
export const selectDiscountTypes = (state: RootState): DiscountType[] => state.settings.discountTypes.items;
export const selectDiscountTypesLoading = (state: RootState) => state.settings.discountTypes.loading;
export const selectDiscountTypesErrors = (state: RootState) => state.settings.discountTypes.errors;

// Lesson Statuses selectors
export const selectLessonStatuses = (state: RootState): LessonStatus[] => state.settings.lessonStatuses.items;
export const selectLessonStatusesLoading = (state: RootState) => state.settings.lessonStatuses.loading;
export const selectLessonStatusesErrors = (state: RootState) => state.settings.lessonStatuses.errors;

// Academic Calendar selectors
export const selectAcademicYears = (state: RootState): AcademicYear[] => state.settings.academicCalendar.academicYears;
export const selectActiveAcademicYearId = (state: RootState): string | null => state.settings.academicCalendar.activeAcademicYearId;
export const selectSemestersByYearId = (yearId: string) => (state: RootState): Semester[] =>
  state.settings.academicCalendar.semesters[yearId] ?? [];
export const selectTeachingBreaksByYearId = (yearId: string) => (state: RootState): TeachingBreak[] =>
  state.settings.academicCalendar.teachingBreaks[yearId] ?? [];
export const selectAcademicCalendarLoading = (state: RootState) => state.settings.academicCalendar.loading;
export const selectAcademicCalendarErrors = (state: RootState) => state.settings.academicCalendar.errors;

export default settingsSlice.reducer;
