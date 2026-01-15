import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TeacherResponse, SubjectDto, TeacherSearchParams } from '@/types/api/teacher';
import {
  SalaryCalculation,
  SalaryCalculationDetail,
  SalaryAdjustment,
  TeacherSalaryPreview,
  SalaryAuditLog,
} from './_shared/types/salaryCalculation.types';
import { TeacherBaseSalaryResponse } from '@/types/api/teacherBaseSalary';
import { teacherBaseSalaryService } from '@/services/teacherBaseSalaryService';

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
  fetchingSalaryCalculations: boolean;
  fetchingSalaryCalculationDetail: boolean;
  generatingSalaryCalculation: boolean;
  approvingSalaryCalculation: boolean;
  reopeningSalaryCalculation: boolean;
  fetchingSalaryPreview: boolean;
  fetchingSalaryAuditLog: boolean;
  creatingSalaryAdjustment: boolean;
  deletingSalaryAdjustment: boolean;
  fetchingBaseSalary: boolean;
  settingBaseSalary: boolean;
}

// Error states for different operations
export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  search: string | null;
  fetchSubjects: string | null;
  fetchSalaryCalculations: string | null;
  fetchSalaryCalculationDetail: string | null;
  generateSalaryCalculation: string | null;
  approveSalaryCalculation: string | null;
  reopenSalaryCalculation: string | null;
  fetchSalaryPreview: string | null;
  fetchSalaryAuditLog: string | null;
  createSalaryAdjustment: string | null;
  deleteSalaryAdjustment: string | null;
  baseSalary: string | null;
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

  // Salary calculations (Phase 7.1 - Variable Salary Feature)
  salaryCalculations: {
    items: SalaryCalculation[];
  };
  salaryCalculationDetail: SalaryCalculationDetail | null;
  salaryPreview: TeacherSalaryPreview | null;
  salaryAuditLogs: SalaryAuditLog[];

  // Base salary (Employment Type Feature - Full Time teachers)
  baseSalary: TeacherBaseSalaryResponse | null;
  baseSalaryHistory: TeacherBaseSalaryResponse[];
}

const initialLoadingStates: LoadingStates = {
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  searching: false,
  fetchingSubjects: false,
  fetchingSalaryCalculations: false,
  fetchingSalaryCalculationDetail: false,
  generatingSalaryCalculation: false,
  approvingSalaryCalculation: false,
  reopeningSalaryCalculation: false,
  fetchingSalaryPreview: false,
  fetchingSalaryAuditLog: false,
  creatingSalaryAdjustment: false,
  deletingSalaryAdjustment: false,
  fetchingBaseSalary: false,
  settingBaseSalary: false,
};

const initialErrorStates: ErrorStates = {
  fetch: null,
  create: null,
  update: null,
  delete: null,
  search: null,
  fetchSubjects: null,
  fetchSalaryCalculations: null,
  fetchSalaryCalculationDetail: null,
  generateSalaryCalculation: null,
  approveSalaryCalculation: null,
  reopenSalaryCalculation: null,
  fetchSalaryPreview: null,
  fetchSalaryAuditLog: null,
  createSalaryAdjustment: null,
  deleteSalaryAdjustment: null,
  baseSalary: null,
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
  salaryCalculations: {
    items: [],
  },
  salaryCalculationDetail: null,
  salaryPreview: null,
  salaryAuditLogs: [],
  baseSalary: null,
  baseSalaryHistory: [],
};

// ════════════════════════════════════════════════════════════════════════
// ASYNC THUNKS - BASE SALARY (Employment Type Feature)
// ════════════════════════════════════════════════════════════════════════

/**
 * Fetch current base salary for a teacher in a specific academic year
 */
export const fetchBaseSalary = createAsyncThunk(
  'teachers/fetchBaseSalary',
  async ({ teacherId, academicYearId }: { teacherId: string; academicYearId: string }) => {
    return await teacherBaseSalaryService.getBaseSalary(teacherId, academicYearId);
  }
);

/**
 * Set or update base salary for a teacher
 * Creates new version and deactivates previous one
 */
export const setBaseSalary = createAsyncThunk(
  'teachers/setBaseSalary',
  async ({
    teacherId,
    request,
  }: {
    teacherId: string;
    request: {
      baseNetSalary: number;
      academicYearId: string;
      effectiveFrom?: string;
      changeReason?: string;
    };
  }) => {
    return await teacherBaseSalaryService.setBaseSalary(teacherId, {
      ...request,
      teacherId, // Include teacherId in request body
    });
  }
);

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

    // Error states
    setError: (state, action: PayloadAction<{ operation: keyof ErrorStates; error: string | null }>) => {
      const { operation, error } = action.payload;
      state.errors[operation] = error;
    },
    
    clearError: (state, action: PayloadAction<keyof ErrorStates>) => {
      state.errors[action.payload] = null;
    },
    
    clearAllErrors: (state) => {
      (Object.keys(state.errors) as Array<keyof ErrorStates>).forEach(key => {
        state.errors[key] = null;
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

    // ════════════════════════════════════════════════════════════════════════
    // SALARY CALCULATIONS (Phase 7.1 - Variable Salary Feature)
    // ════════════════════════════════════════════════════════════════════════

    // Salary calculation list
    setSalaryCalculations: (state, action: PayloadAction<SalaryCalculation[]>) => {
      state.salaryCalculations.items = action.payload;
      state.errors.fetchSalaryCalculations = null;
    },

    addSalaryCalculation: (state, action: PayloadAction<SalaryCalculation>) => {
      state.salaryCalculations.items.unshift(action.payload);
      state.errors.generateSalaryCalculation = null;
    },

    updateSalaryCalculation: (state, action: PayloadAction<SalaryCalculation>) => {
      const index = state.salaryCalculations.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.salaryCalculations.items[index] = action.payload;
      }
      // Also update the detail if it's the same calculation (flat structure uses calculationId)
      if (state.salaryCalculationDetail?.calculationId === action.payload.id) {
        // Update the relevant fields in the flat structure
        state.salaryCalculationDetail = {
          ...state.salaryCalculationDetail,
          calculatedAmount: action.payload.calculatedAmount,
          approvedAmount: action.payload.approvedAmount,
          status: action.payload.status,
          approvedAt: action.payload.approvedAt,
          updatedAt: action.payload.updatedAt,
        };
      }
    },

    // Helper to update calculation from detail response (approve/reopen actions)
    updateSalaryCalculationInState: (state, action: PayloadAction<SalaryCalculation>) => {
      const index = state.salaryCalculations.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.salaryCalculations.items[index] = action.payload;
      }
    },

    clearSalaryCalculations: (state) => {
      state.salaryCalculations.items = [];
    },

    // Salary calculation detail
    setSalaryCalculationDetail: (state, action: PayloadAction<SalaryCalculationDetail | null>) => {
      state.salaryCalculationDetail = action.payload;
      state.errors.fetchSalaryCalculationDetail = null;
    },

    clearSalaryCalculationDetail: (state) => {
      state.salaryCalculationDetail = null;
    },

    // Salary preview
    setSalaryPreview: (state, action: PayloadAction<TeacherSalaryPreview | null>) => {
      state.salaryPreview = action.payload;
      state.errors.fetchSalaryPreview = null;
    },

    clearSalaryPreview: (state) => {
      state.salaryPreview = null;
    },

    // Salary audit logs
    setSalaryAuditLogs: (state, action: PayloadAction<SalaryAuditLog[]>) => {
      state.salaryAuditLogs = action.payload;
      state.errors.fetchSalaryAuditLog = null;
    },

    clearSalaryAuditLogs: (state) => {
      state.salaryAuditLogs = [];
    },

    // ════════════════════════════════════════════════════════════════════════
    // SALARY ADJUSTMENTS (Bonuses/Deductions)
    // ════════════════════════════════════════════════════════════════════════

    addSalaryAdjustment: (state, action: PayloadAction<SalaryAdjustment>) => {
      if (state.salaryCalculationDetail) {
        // Add the adjustment to the list
        state.salaryCalculationDetail.adjustments.push(action.payload);
        // Recalculate totals
        const adjustmentsTotal = state.salaryCalculationDetail.adjustments.reduce(
          (sum, adj) => sum + (adj.adjustmentType === 'addition' ? adj.amount : -adj.amount),
          0
        );
        state.salaryCalculationDetail.adjustmentsTotal = adjustmentsTotal;
        state.salaryCalculationDetail.grandTotal =
          state.salaryCalculationDetail.calculatedAmount + adjustmentsTotal;
      }
      state.errors.createSalaryAdjustment = null;
    },

    removeSalaryAdjustment: (state, action: PayloadAction<string>) => {
      if (state.salaryCalculationDetail) {
        // Remove the adjustment from the list
        state.salaryCalculationDetail.adjustments =
          state.salaryCalculationDetail.adjustments.filter(adj => adj.id !== action.payload);
        // Recalculate totals
        const adjustmentsTotal = state.salaryCalculationDetail.adjustments.reduce(
          (sum, adj) => sum + (adj.adjustmentType === 'addition' ? adj.amount : -adj.amount),
          0
        );
        state.salaryCalculationDetail.adjustmentsTotal = adjustmentsTotal;
        state.salaryCalculationDetail.grandTotal =
          state.salaryCalculationDetail.calculatedAmount + adjustmentsTotal;
      }
      state.errors.deleteSalaryAdjustment = null;
    },

    // ════════════════════════════════════════════════════════════════════════
    // BASE SALARY (Employment Type Feature)
    // ════════════════════════════════════════════════════════════════════════

    setBaseSalaryData: (state, action: PayloadAction<TeacherBaseSalaryResponse | null>) => {
      state.baseSalary = action.payload;
      state.errors.baseSalary = null;
    },

    setBaseSalaryHistory: (state, action: PayloadAction<TeacherBaseSalaryResponse[]>) => {
      state.baseSalaryHistory = action.payload;
    },

    clearBaseSalary: (state) => {
      state.baseSalary = null;
      state.baseSalaryHistory = [];
    },
  },
  extraReducers: (builder) => {
    // ════════════════════════════════════════════════════════════════════════
    // BASE SALARY - Fetch
    // ════════════════════════════════════════════════════════════════════════
    builder.addCase(fetchBaseSalary.pending, (state) => {
      state.loading.fetchingBaseSalary = true;
      state.errors.baseSalary = null;
    });
    builder.addCase(fetchBaseSalary.fulfilled, (state, action) => {
      state.loading.fetchingBaseSalary = false;
      state.baseSalary = action.payload;
      state.errors.baseSalary = null;
    });
    builder.addCase(fetchBaseSalary.rejected, (state, action) => {
      state.loading.fetchingBaseSalary = false;
      state.errors.baseSalary = action.error.message ?? 'Failed to fetch base salary';
    });

    // ════════════════════════════════════════════════════════════════════════
    // BASE SALARY - Set/Update
    // ════════════════════════════════════════════════════════════════════════
    builder.addCase(setBaseSalary.pending, (state) => {
      state.loading.settingBaseSalary = true;
      state.errors.baseSalary = null;
    });
    builder.addCase(setBaseSalary.fulfilled, (state, action) => {
      state.loading.settingBaseSalary = false;
      state.baseSalary = action.payload;
      // Add to history (prepend since it's the newest)
      state.baseSalaryHistory = [action.payload, ...state.baseSalaryHistory];
      state.errors.baseSalary = null;
    });
    builder.addCase(setBaseSalary.rejected, (state, action) => {
      state.loading.settingBaseSalary = false;
      state.errors.baseSalary = action.error.message ?? 'Failed to set base salary';
    });
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

  // Salary calculations (Phase 7.1)
  setSalaryCalculations,
  addSalaryCalculation,
  updateSalaryCalculation,
  updateSalaryCalculationInState,
  clearSalaryCalculations,
  setSalaryCalculationDetail,
  clearSalaryCalculationDetail,
  setSalaryPreview,
  clearSalaryPreview,
  setSalaryAuditLogs,
  clearSalaryAuditLogs,

  // Salary adjustments
  addSalaryAdjustment,
  removeSalaryAdjustment,

  // Base salary (Employment Type Feature)
  setBaseSalaryData,
  setBaseSalaryHistory,
  clearBaseSalary,
} = teachersSlice.actions;

export default teachersSlice.reducer;

// Selectors
export const selectErrors = (state: { teachers: TeachersState }) => state.teachers.errors;

