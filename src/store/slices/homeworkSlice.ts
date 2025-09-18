import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  HomeworkAssignmentResponse,
  CreateHomeworkAssignmentRequest,
  UpdateHomeworkAssignmentRequest,
  PreviousHomeworkResponse,
  HomeworkCompletionSummaryResponse,
  HomeworkManagementState
} from '@/types/api/homework';
import { homeworkApiService } from '@/services/homeworkApiService';
import { RootState } from '@/store';

// Extended homework assignment interface for Redux state management
export interface HomeworkAssignment extends HomeworkAssignmentResponse {
  // Additional UI-specific properties
  isSelected?: boolean;
  isExpanded?: boolean;
  hasUnsavedChanges?: boolean;
}

interface HomeworkState {
  // Homework assignments data keyed by lesson ID for efficient lookups
  assignmentsByLessonId: Record<string, HomeworkAssignment>;
  previousHomeworkByLessonId: Record<string, PreviousHomeworkResponse>;
  completionSummaryByLessonId: Record<string, HomeworkCompletionSummaryResponse>;
  
  // Current homework management context
  currentLessonId: string | null;
  currentAssignment: HomeworkAssignment | null;
  currentPreviousHomework: PreviousHomeworkResponse | null;
  currentCompletionSummary: HomeworkCompletionSummaryResponse | null;
  
  // Loading states for different operations
  loading: boolean;
  loadingStates: {
    fetchingAssignment: boolean;
    fetchingPreviousHomework: boolean;
    fetchingCompletionSummary: boolean;
    creatingAssignment: boolean;
    updatingAssignment: boolean;
    deletingAssignment: boolean;
    fetchingWithPrevious: boolean;
  };
  
  // Error handling
  error: string | null;
  validationErrors: Record<string, string>;
  
  // UI state
  isModalOpen: boolean;
  modalMode: 'check' | 'assign' | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  
  // Form state for homework assignment form
  formData: {
    title: string;
    description: string;
    dueDate: string;
    assignmentType: 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'general';
    instructions: string;
  };
  
  // Cache metadata
  lastFetchTimestamp: Record<string, number>;
  cacheExpiration: number; // milliseconds
}

const initialFormData = {
  title: '',
  description: '',
  dueDate: '',
  assignmentType: 'general' as const,
  instructions: ''
};

const initialState: HomeworkState = {
  assignmentsByLessonId: {},
  previousHomeworkByLessonId: {},
  completionSummaryByLessonId: {},
  currentLessonId: null,
  currentAssignment: null,
  currentPreviousHomework: null,
  currentCompletionSummary: null,
  loading: false,
  loadingStates: {
    fetchingAssignment: false,
    fetchingPreviousHomework: false,
    fetchingCompletionSummary: false,
    creatingAssignment: false,
    updatingAssignment: false,
    deletingAssignment: false,
    fetchingWithPrevious: false,
  },
  error: null,
  validationErrors: {},
  isModalOpen: false,
  modalMode: null,
  isEditing: false,
  hasUnsavedChanges: false,
  formData: initialFormData,
  lastFetchTimestamp: {},
  cacheExpiration: 5 * 60 * 1000, // 5 minutes
};

// Async thunks
export const fetchHomeworkAssignment = createAsyncThunk(
  'homework/fetchAssignment',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const assignment = await homeworkApiService.getHomeworkAssignment(lessonId);
      return { lessonId, assignment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch homework assignment');
    }
  }
);

export const createHomeworkAssignment = createAsyncThunk(
  'homework/createAssignment',
  async ({ lessonId, request }: { lessonId: string; request: CreateHomeworkAssignmentRequest }, { rejectWithValue }) => {
    try {
      const assignment = await homeworkApiService.createHomeworkAssignment(lessonId, request);
      return { lessonId, assignment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create homework assignment');
    }
  }
);

export const updateHomeworkAssignment = createAsyncThunk(
  'homework/updateAssignment',
  async ({ lessonId, request }: { lessonId: string; request: UpdateHomeworkAssignmentRequest }, { rejectWithValue }) => {
    try {
      const assignment = await homeworkApiService.updateHomeworkAssignment(lessonId, request);
      return { lessonId, assignment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update homework assignment');
    }
  }
);

export const deleteHomeworkAssignment = createAsyncThunk(
  'homework/deleteAssignment',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      await homeworkApiService.deleteHomeworkAssignment(lessonId);
      return { lessonId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete homework assignment');
    }
  }
);

export const fetchPreviousHomework = createAsyncThunk(
  'homework/fetchPreviousHomework',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const previousHomework = await homeworkApiService.getPreviousHomework(lessonId);
      return { lessonId, previousHomework };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch previous homework');
    }
  }
);

export const fetchHomeworkCompletionSummary = createAsyncThunk(
  'homework/fetchCompletionSummary',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const completionSummary = await homeworkApiService.getHomeworkCompletionSummary(lessonId);
      return { lessonId, completionSummary };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch homework completion summary');
    }
  }
);

export const fetchHomeworkWithPrevious = createAsyncThunk(
  'homework/fetchWithPrevious',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const result = await homeworkApiService.getHomeworkWithPrevious(lessonId);
      return { lessonId, ...result };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch homework data');
    }
  }
);

export const upsertHomeworkAssignment = createAsyncThunk(
  'homework/upsertAssignment',
  async ({ lessonId, request }: { lessonId: string; request: CreateHomeworkAssignmentRequest | UpdateHomeworkAssignmentRequest }, { rejectWithValue }) => {
    try {
      const assignment = await homeworkApiService.upsertHomeworkAssignment(lessonId, request);
      return { lessonId, assignment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save homework assignment');
    }
  }
);

const homeworkSlice = createSlice({
  name: 'homework',
  initialState,
  reducers: {
    // Modal management
    openHomeworkModal: (state, action: PayloadAction<{ lessonId: string; mode: 'check' | 'assign' }>) => {
      state.isModalOpen = true;
      state.modalMode = action.payload.mode;
      state.currentLessonId = action.payload.lessonId;
      state.error = null;
      state.validationErrors = {};
      
      // Initialize form data if in assign mode
      if (action.payload.mode === 'assign') {
        const existingAssignment = state.assignmentsByLessonId[action.payload.lessonId];
        if (existingAssignment) {
          state.formData = {
            title: existingAssignment.title,
            description: existingAssignment.description || '',
            dueDate: existingAssignment.dueDate || '',
            assignmentType: existingAssignment.assignmentType,
            instructions: existingAssignment.instructions || ''
          };
          state.isEditing = true;
        } else {
          state.formData = initialFormData;
          state.isEditing = false;
        }
      }
    },

    closeHomeworkModal: (state) => {
      state.isModalOpen = false;
      state.modalMode = null;
      state.currentLessonId = null;
      state.currentAssignment = null;
      state.currentPreviousHomework = null;
      state.error = null;
      state.validationErrors = {};
      state.formData = initialFormData;
      state.isEditing = false;
      state.hasUnsavedChanges = false;
    },

    setModalMode: (state, action: PayloadAction<'check' | 'assign'>) => {
      state.modalMode = action.payload;
      
      // Reset form data when switching to assign mode
      if (action.payload === 'assign' && state.currentLessonId) {
        const existingAssignment = state.assignmentsByLessonId[state.currentLessonId];
        if (existingAssignment) {
          state.formData = {
            title: existingAssignment.title,
            description: existingAssignment.description || '',
            dueDate: existingAssignment.dueDate || '',
            assignmentType: existingAssignment.assignmentType,
            instructions: existingAssignment.instructions || ''
          };
          state.isEditing = true;
        } else {
          state.formData = initialFormData;
          state.isEditing = false;
        }
        state.hasUnsavedChanges = false;
      }
    },

    // Form management
    updateFormData: (state, action: PayloadAction<Partial<typeof initialFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
      state.hasUnsavedChanges = true;
      
      // Clear field-specific validation errors
      Object.keys(action.payload).forEach(field => {
        delete state.validationErrors[field];
      });
    },

    resetFormData: (state) => {
      state.formData = initialFormData;
      state.hasUnsavedChanges = false;
      state.isEditing = false;
      state.validationErrors = {};
    },

    // Validation
    setValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.validationErrors = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },

    // Error management
    clearError: (state) => {
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Current context management
    setCurrentLessonContext: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      state.currentLessonId = lessonId;
      state.currentAssignment = state.assignmentsByLessonId[lessonId] || null;
      state.currentPreviousHomework = state.previousHomeworkByLessonId[lessonId] || null;
      state.currentCompletionSummary = state.completionSummaryByLessonId[lessonId] || null;
    },

    // Direct data management
    setHomeworkAssignment: (state, action: PayloadAction<{ lessonId: string; assignment: HomeworkAssignment }>) => {
      const { lessonId, assignment } = action.payload;
      state.assignmentsByLessonId[lessonId] = assignment;
      state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
      
      if (state.currentLessonId === lessonId) {
        state.currentAssignment = assignment;
      }
    },

    setPreviousHomework: (state, action: PayloadAction<{ lessonId: string; previousHomework: PreviousHomeworkResponse }>) => {
      const { lessonId, previousHomework } = action.payload;
      state.previousHomeworkByLessonId[lessonId] = previousHomework;
      state.lastFetchTimestamp[`previous_${lessonId}`] = Date.now();
      
      if (state.currentLessonId === lessonId) {
        state.currentPreviousHomework = previousHomework;
      }
    },

    setCompletionSummary: (state, action: PayloadAction<{ lessonId: string; completionSummary: HomeworkCompletionSummaryResponse }>) => {
      const { lessonId, completionSummary } = action.payload;
      state.completionSummaryByLessonId[lessonId] = completionSummary;
      state.lastFetchTimestamp[`completion_${lessonId}`] = Date.now();
      
      if (state.currentLessonId === lessonId) {
        state.currentCompletionSummary = completionSummary;
      }
    },

    // Cache management
    clearCache: (state) => {
      state.assignmentsByLessonId = {};
      state.previousHomeworkByLessonId = {};
      state.completionSummaryByLessonId = {};
      state.lastFetchTimestamp = {};
    },

    clearCacheForLesson: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      delete state.assignmentsByLessonId[lessonId];
      delete state.previousHomeworkByLessonId[lessonId];
      delete state.completionSummaryByLessonId[lessonId];
      delete state.lastFetchTimestamp[`assignment_${lessonId}`];
      delete state.lastFetchTimestamp[`previous_${lessonId}`];
      delete state.lastFetchTimestamp[`completion_${lessonId}`];
    },
  },
  extraReducers: (builder) => {
    // Fetch homework assignment
    builder
      .addCase(fetchHomeworkAssignment.pending, (state) => {
        state.loadingStates.fetchingAssignment = true;
        state.error = null;
      })
      .addCase(fetchHomeworkAssignment.fulfilled, (state, action) => {
        state.loadingStates.fetchingAssignment = false;
        const { lessonId, assignment } = action.payload;
        
        if (assignment) {
          state.assignmentsByLessonId[lessonId] = assignment;
          if (state.currentLessonId === lessonId) {
            state.currentAssignment = assignment;
          }
        }
        
        state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
      })
      .addCase(fetchHomeworkAssignment.rejected, (state, action) => {
        state.loadingStates.fetchingAssignment = false;
        state.error = action.payload as string;
      });

    // Create homework assignment
    builder
      .addCase(createHomeworkAssignment.pending, (state) => {
        state.loadingStates.creatingAssignment = true;
        state.error = null;
      })
      .addCase(createHomeworkAssignment.fulfilled, (state, action) => {
        state.loadingStates.creatingAssignment = false;
        const { lessonId, assignment } = action.payload;
        
        state.assignmentsByLessonId[lessonId] = assignment;
        if (state.currentLessonId === lessonId) {
          state.currentAssignment = assignment;
        }
        
        state.hasUnsavedChanges = false;
        state.isEditing = true;
        state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
      })
      .addCase(createHomeworkAssignment.rejected, (state, action) => {
        state.loadingStates.creatingAssignment = false;
        state.error = action.payload as string;
      });

    // Update homework assignment
    builder
      .addCase(updateHomeworkAssignment.pending, (state) => {
        state.loadingStates.updatingAssignment = true;
        state.error = null;
      })
      .addCase(updateHomeworkAssignment.fulfilled, (state, action) => {
        state.loadingStates.updatingAssignment = false;
        const { lessonId, assignment } = action.payload;
        
        state.assignmentsByLessonId[lessonId] = assignment;
        if (state.currentLessonId === lessonId) {
          state.currentAssignment = assignment;
        }
        
        state.hasUnsavedChanges = false;
        state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
      })
      .addCase(updateHomeworkAssignment.rejected, (state, action) => {
        state.loadingStates.updatingAssignment = false;
        state.error = action.payload as string;
      });

    // Delete homework assignment
    builder
      .addCase(deleteHomeworkAssignment.pending, (state) => {
        state.loadingStates.deletingAssignment = true;
        state.error = null;
      })
      .addCase(deleteHomeworkAssignment.fulfilled, (state, action) => {
        state.loadingStates.deletingAssignment = false;
        const { lessonId } = action.payload;
        
        delete state.assignmentsByLessonId[lessonId];
        if (state.currentLessonId === lessonId) {
          state.currentAssignment = null;
        }
        
        delete state.lastFetchTimestamp[`assignment_${lessonId}`];
      })
      .addCase(deleteHomeworkAssignment.rejected, (state, action) => {
        state.loadingStates.deletingAssignment = false;
        state.error = action.payload as string;
      });

    // Fetch previous homework
    builder
      .addCase(fetchPreviousHomework.pending, (state) => {
        state.loadingStates.fetchingPreviousHomework = true;
        state.error = null;
      })
      .addCase(fetchPreviousHomework.fulfilled, (state, action) => {
        state.loadingStates.fetchingPreviousHomework = false;
        const { lessonId, previousHomework } = action.payload;
        
        state.previousHomeworkByLessonId[lessonId] = previousHomework;
        if (state.currentLessonId === lessonId) {
          state.currentPreviousHomework = previousHomework;
        }
        
        state.lastFetchTimestamp[`previous_${lessonId}`] = Date.now();
      })
      .addCase(fetchPreviousHomework.rejected, (state, action) => {
        state.loadingStates.fetchingPreviousHomework = false;
        state.error = action.payload as string;
      });

    // Fetch homework completion summary
    builder
      .addCase(fetchHomeworkCompletionSummary.pending, (state) => {
        state.loadingStates.fetchingCompletionSummary = true;
        state.error = null;
      })
      .addCase(fetchHomeworkCompletionSummary.fulfilled, (state, action) => {
        state.loadingStates.fetchingCompletionSummary = false;
        const { lessonId, completionSummary } = action.payload;
        
        state.completionSummaryByLessonId[lessonId] = completionSummary;
        if (state.currentLessonId === lessonId) {
          state.currentCompletionSummary = completionSummary;
        }
        
        state.lastFetchTimestamp[`completion_${lessonId}`] = Date.now();
      })
      .addCase(fetchHomeworkCompletionSummary.rejected, (state, action) => {
        state.loadingStates.fetchingCompletionSummary = false;
        state.error = action.payload as string;
      });

    // Fetch homework with previous
    builder
      .addCase(fetchHomeworkWithPrevious.pending, (state) => {
        state.loadingStates.fetchingWithPrevious = true;
        state.error = null;
      })
      .addCase(fetchHomeworkWithPrevious.fulfilled, (state, action) => {
        state.loadingStates.fetchingWithPrevious = false;
        const { lessonId, currentAssignment, previousHomework } = action.payload;
        
        if (currentAssignment) {
          state.assignmentsByLessonId[lessonId] = currentAssignment;
        }
        state.previousHomeworkByLessonId[lessonId] = previousHomework;
        
        if (state.currentLessonId === lessonId) {
          state.currentAssignment = currentAssignment;
          state.currentPreviousHomework = previousHomework;
        }
        
        state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
        state.lastFetchTimestamp[`previous_${lessonId}`] = Date.now();
      })
      .addCase(fetchHomeworkWithPrevious.rejected, (state, action) => {
        state.loadingStates.fetchingWithPrevious = false;
        state.error = action.payload as string;
      });

    // Upsert homework assignment
    builder
      .addCase(upsertHomeworkAssignment.pending, (state) => {
        state.loadingStates.creatingAssignment = true;
        state.loadingStates.updatingAssignment = true;
        state.error = null;
      })
      .addCase(upsertHomeworkAssignment.fulfilled, (state, action) => {
        state.loadingStates.creatingAssignment = false;
        state.loadingStates.updatingAssignment = false;
        const { lessonId, assignment } = action.payload;
        
        state.assignmentsByLessonId[lessonId] = assignment;
        if (state.currentLessonId === lessonId) {
          state.currentAssignment = assignment;
        }
        
        state.hasUnsavedChanges = false;
        state.isEditing = true;
        state.lastFetchTimestamp[`assignment_${lessonId}`] = Date.now();
      })
      .addCase(upsertHomeworkAssignment.rejected, (state, action) => {
        state.loadingStates.creatingAssignment = false;
        state.loadingStates.updatingAssignment = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  openHomeworkModal,
  closeHomeworkModal,
  setModalMode,
  updateFormData,
  resetFormData,
  setValidationErrors,
  clearValidationErrors,
  clearError,
  setError,
  setCurrentLessonContext,
  setHomeworkAssignment,
  setPreviousHomework,
  setCompletionSummary,
  clearCache,
  clearCacheForLesson,
} = homeworkSlice.actions;

// Selectors
export const selectHomeworkState = (state: RootState) => state.homework;
export const selectIsHomeworkModalOpen = (state: RootState) => state.homework.isModalOpen;
export const selectHomeworkModalMode = (state: RootState) => state.homework.modalMode;
export const selectCurrentHomeworkAssignment = (state: RootState) => state.homework.currentAssignment;
export const selectCurrentPreviousHomework = (state: RootState) => state.homework.currentPreviousHomework;
export const selectCurrentCompletionSummary = (state: RootState) => state.homework.currentCompletionSummary;
export const selectHomeworkFormData = (state: RootState) => state.homework.formData;
export const selectHomeworkValidationErrors = (state: RootState) => state.homework.validationErrors;
export const selectHomeworkError = (state: RootState) => state.homework.error;
export const selectHomeworkLoadingStates = (state: RootState) => state.homework.loadingStates;
export const selectIsHomeworkLoading = (state: RootState) => 
  Object.values(state.homework.loadingStates).some(loading => loading);

// Get homework assignment for specific lesson
export const selectHomeworkAssignmentByLessonId = (state: RootState, lessonId: string) =>
  state.homework.assignmentsByLessonId[lessonId] || null;

// Get previous homework for specific lesson
export const selectPreviousHomeworkByLessonId = (state: RootState, lessonId: string) =>
  state.homework.previousHomeworkByLessonId[lessonId] || null;

// Get completion summary for specific lesson
export const selectCompletionSummaryByLessonId = (state: RootState, lessonId: string) =>
  state.homework.completionSummaryByLessonId[lessonId] || null;

// Check if data is cached and fresh
export const selectIsHomeworkDataFresh = (state: RootState, lessonId: string, type: 'assignment' | 'previous' | 'completion') => {
  const key = `${type}_${lessonId}`;
  const lastFetch = state.homework.lastFetchTimestamp[key];
  if (!lastFetch) return false;
  
  return (Date.now() - lastFetch) < state.homework.cacheExpiration;
};

export default homeworkSlice.reducer;