import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  LessonResponse, 
  LessonSummary,
  LessonSearchParams,
  CreateLessonRequest,
  CancelLessonRequest,
  MarkLessonConductedRequest,
  CreateMakeupLessonRequest,
  GenerateLessonsRequest,
  LessonGenerationResult,
  LessonStatusName,
  MakeupLessonFormData
} from '@/types/api/lesson';
import lessonApiService from '@/services/lessonApiService';
import { RootState } from '@/store';

// Extended lesson interface for Redux state management
export interface Lesson extends LessonResponse {
  // Additional UI-specific properties can be added here if needed
  isSelected?: boolean;
  isExpanded?: boolean;
}

interface LessonsState {
  // Lesson data
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  
  // Loading states
  loading: boolean;
  loadingStates: {
    fetchingLessons: boolean;
    fetchingLesson: boolean;
    creatingLesson: boolean;
    updatingLesson: boolean;
    cancellingLesson: boolean;
    conductingLesson: boolean;
    creatingMakeup: boolean;
    generatingLessons: boolean;
  };
  
  // Error handling
  error: string | null;
  
  // UI state
  filters: LessonSearchParams;
  viewMode: 'list' | 'calendar' | 'timeline';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Quick access data
  todayLessons: Lesson[];
  upcomingLessons: Lesson[];
  
  // Generation results
  lastGenerationResult: LessonGenerationResult | null;
}

const initialState: LessonsState = {
  lessons: [],
  selectedLesson: null,
  loading: false,
  loadingStates: {
    fetchingLessons: false,
    fetchingLesson: false,
    creatingLesson: false,
    updatingLesson: false,
    cancellingLesson: false,
    conductingLesson: false,
    creatingMakeup: false,
    generatingLessons: false,
  },
  error: null,
  filters: {},
  viewMode: 'list',
  dateRange: {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  },
  todayLessons: [],
  upcomingLessons: [],
  lastGenerationResult: null,
};

// Async thunks
export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (params: LessonSearchParams = {}) => {
    return await lessonApiService.getLessons(params);
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (id: string) => {
    return await lessonApiService.getLessonById(id);
  }
);

export const fetchLessonsForClass = createAsyncThunk(
  'lessons/fetchLessonsForClass',
  async ({ classId, includeHistory }: { classId: string; includeHistory?: boolean }) => {
    return await lessonApiService.getLessonsForClass(classId, includeHistory);
  }
);


export const createLesson = createAsyncThunk(
  'lessons/createLesson',
  async (request: CreateLessonRequest) => {
    const response = await lessonApiService.createLesson(request);
    // Return the created lesson by fetching it
    return await lessonApiService.getLessonById(response.id);
  }
);

export const cancelLesson = createAsyncThunk(
  'lessons/cancelLesson',
  async ({ id, request }: { id: string; request: CancelLessonRequest }) => {
    return await lessonApiService.cancelLesson(id, request);
  }
);

export const conductLesson = createAsyncThunk(
  'lessons/conductLesson',
  async ({ id, request }: { id: string; request?: MarkLessonConductedRequest }) => {
    return await lessonApiService.conductLesson(id, request);
  }
);

export const createMakeupLesson = createAsyncThunk(
  'lessons/createMakeupLesson',
  async ({ originalLessonId, request }: { originalLessonId: string; request: CreateMakeupLessonRequest }) => {
    const response = await lessonApiService.createMakeupLesson(originalLessonId, request);
    // Return the created makeup lesson by fetching it
    return await lessonApiService.getLessonById(response.id);
  }
);

export const generateLessons = createAsyncThunk(
  'lessons/generateLessons',
  async (request: GenerateLessonsRequest) => {
    return await lessonApiService.generateLessons(request);
  }
);

export const fetchTodayLessons = createAsyncThunk(
  'lessons/fetchTodayLessons',
  async () => {
    return await lessonApiService.getTodayLessons();
  }
);

export const fetchUpcomingLessons = createAsyncThunk(
  'lessons/fetchUpcomingLessons',
  async (days?: number) => {
    return await lessonApiService.getUpcomingLessons(days);
  }
);

export const quickConductLesson = createAsyncThunk(
  'lessons/quickConductLesson',
  async ({ id, notes }: { id: string; notes?: string }) => {
    return await lessonApiService.quickConductLesson(id, notes);
  }
);

export const quickCancelLesson = createAsyncThunk(
  'lessons/quickCancelLesson',
  async ({ id, reason, makeupData }: { id: string; reason: string; makeupData?: MakeupLessonFormData }) => {
    return await lessonApiService.quickCancelLesson(id, reason, makeupData);
  }
);

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    // Direct state updates
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
    },
    
    addLesson: (state, action: PayloadAction<Lesson>) => {
      state.lessons.push(action.payload);
    },
    
    updateLesson: (state, action: PayloadAction<{ id: string; updates: Partial<Lesson> }>) => {
      const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
      if (index !== -1) {
        state.lessons[index] = { ...state.lessons[index], ...action.payload.updates };
      }
      // Also update selected lesson if it matches
      if (state.selectedLesson?.id === action.payload.id) {
        state.selectedLesson = { ...state.selectedLesson, ...action.payload.updates };
      }
    },
    
    removeLesson: (state, action: PayloadAction<string>) => {
      state.lessons = state.lessons.filter(lesson => lesson.id !== action.payload);
      if (state.selectedLesson?.id === action.payload) {
        state.selectedLesson = null;
      }
    },
    
    setSelectedLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.selectedLesson = action.payload;
    },
    
    // UI state management
    setFilters: (state, action: PayloadAction<LessonSearchParams>) => {
      state.filters = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<LessonSearchParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    setViewMode: (state, action: PayloadAction<'list' | 'calendar' | 'timeline'>) => {
      state.viewMode = action.payload;
    },
    
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Lesson selection/expansion for UI
    toggleLessonSelection: (state, action: PayloadAction<string>) => {
      const lesson = state.lessons.find(l => l.id === action.payload);
      if (lesson) {
        lesson.isSelected = !lesson.isSelected;
      }
    },
    
    toggleLessonExpansion: (state, action: PayloadAction<string>) => {
      const lesson = state.lessons.find(l => l.id === action.payload);
      if (lesson) {
        lesson.isExpanded = !lesson.isExpanded;
      }
    },
    
    // Bulk operations
    selectAllLessons: (state) => {
      state.lessons.forEach(lesson => { lesson.isSelected = true; });
    },
    
    deselectAllLessons: (state) => {
      state.lessons.forEach(lesson => { lesson.isSelected = false; });
    },
  },
  
  extraReducers: (builder) => {
    // Fetch lessons
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.loadingStates.fetchingLessons = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loadingStates.fetchingLessons = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loadingStates.fetchingLessons = false;
        state.error = action.error.message || 'Failed to fetch lessons';
      });

    // Fetch lesson by ID
    builder
      .addCase(fetchLessonById.pending, (state) => {
        state.loadingStates.fetchingLesson = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loadingStates.fetchingLesson = false;
        state.selectedLesson = action.payload;
        // Update in lessons array if it exists
        const index = state.lessons.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loadingStates.fetchingLesson = false;
        state.error = action.error.message || 'Failed to fetch lesson';
      });

    // Fetch lessons for class
    builder
      .addCase(fetchLessonsForClass.pending, (state) => {
        state.loadingStates.fetchingLessons = true;
        state.error = null;
      })
      .addCase(fetchLessonsForClass.fulfilled, (state, action) => {
        state.loadingStates.fetchingLessons = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessonsForClass.rejected, (state, action) => {
        state.loadingStates.fetchingLessons = false;
        state.error = action.error.message || 'Failed to fetch class lessons';
      });


    // Create lesson
    builder
      .addCase(createLesson.pending, (state) => {
        state.loadingStates.creatingLesson = true;
        state.error = null;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.loadingStates.creatingLesson = false;
        state.lessons.push(action.payload);
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.loadingStates.creatingLesson = false;
        state.error = action.error.message || 'Failed to create lesson';
      });

    // Cancel lesson
    builder
      .addCase(cancelLesson.pending, (state) => {
        state.loadingStates.cancellingLesson = true;
        state.error = null;
      })
      .addCase(cancelLesson.fulfilled, (state, action) => {
        state.loadingStates.cancellingLesson = false;
        const index = state.lessons.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
        if (state.selectedLesson?.id === action.payload.id) {
          state.selectedLesson = action.payload;
        }
      })
      .addCase(cancelLesson.rejected, (state, action) => {
        state.loadingStates.cancellingLesson = false;
        state.error = action.error.message || 'Failed to cancel lesson';
      });

    // Conduct lesson
    builder
      .addCase(conductLesson.pending, (state) => {
        state.loadingStates.conductingLesson = true;
        state.error = null;
      })
      .addCase(conductLesson.fulfilled, (state, action) => {
        state.loadingStates.conductingLesson = false;
        const index = state.lessons.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
        if (state.selectedLesson?.id === action.payload.id) {
          state.selectedLesson = action.payload;
        }
      })
      .addCase(conductLesson.rejected, (state, action) => {
        state.loadingStates.conductingLesson = false;
        state.error = action.error.message || 'Failed to conduct lesson';
      });

    // Create makeup lesson
    builder
      .addCase(createMakeupLesson.pending, (state) => {
        state.loadingStates.creatingMakeup = true;
        state.error = null;
      })
      .addCase(createMakeupLesson.fulfilled, (state, action) => {
        state.loadingStates.creatingMakeup = false;
        state.lessons.push(action.payload);
      })
      .addCase(createMakeupLesson.rejected, (state, action) => {
        state.loadingStates.creatingMakeup = false;
        state.error = action.error.message || 'Failed to create makeup lesson';
      });

    // Generate lessons
    builder
      .addCase(generateLessons.pending, (state) => {
        state.loadingStates.generatingLessons = true;
        state.error = null;
      })
      .addCase(generateLessons.fulfilled, (state, action) => {
        state.loadingStates.generatingLessons = false;
        state.lastGenerationResult = action.payload;
      })
      .addCase(generateLessons.rejected, (state, action) => {
        state.loadingStates.generatingLessons = false;
        state.error = action.error.message || 'Failed to generate lessons';
      });

    // Today lessons
    builder
      .addCase(fetchTodayLessons.fulfilled, (state, action) => {
        state.todayLessons = action.payload;
      });

    // Upcoming lessons
    builder
      .addCase(fetchUpcomingLessons.fulfilled, (state, action) => {
        state.upcomingLessons = action.payload;
      });

    // Quick conduct lesson
    builder
      .addCase(quickConductLesson.pending, (state) => {
        state.loadingStates.conductingLesson = true;
        state.error = null;
      })
      .addCase(quickConductLesson.fulfilled, (state, action) => {
        state.loadingStates.conductingLesson = false;
        const index = state.lessons.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.lessons[index] = action.payload;
        }
        if (state.selectedLesson?.id === action.payload.id) {
          state.selectedLesson = action.payload;
        }
      })
      .addCase(quickConductLesson.rejected, (state, action) => {
        state.loadingStates.conductingLesson = false;
        state.error = action.error.message || 'Failed to conduct lesson';
      });

    // Quick cancel lesson
    builder
      .addCase(quickCancelLesson.pending, (state) => {
        state.loadingStates.cancellingLesson = true;
        state.error = null;
      })
      .addCase(quickCancelLesson.fulfilled, (state, action) => {
        state.loadingStates.cancellingLesson = false;
        const updatedLesson = action.payload;
        
        // Update the original lesson
        const index = state.lessons.findIndex(l => l.id === updatedLesson.id);
        if (index !== -1) {
          state.lessons[index] = updatedLesson;
        }
        if (state.selectedLesson?.id === updatedLesson.id) {
          state.selectedLesson = updatedLesson;
        }
        
        // Note: The makeup lesson will be handled by a separate refresh of the lessons list
        // since our current API design returns the updated original lesson, not both lessons
      })
      .addCase(quickCancelLesson.rejected, (state, action) => {
        state.loadingStates.cancellingLesson = false;
        state.error = action.error.message || 'Failed to cancel lesson';
      });
  },
});

// Actions
export const {
  setLessons,
  addLesson,
  updateLesson,
  removeLesson,
  setSelectedLesson,
  setFilters,
  updateFilters,
  clearFilters,
  setViewMode,
  setDateRange,
  setError,
  clearError,
  toggleLessonSelection,
  toggleLessonExpansion,
  selectAllLessons,
  deselectAllLessons,
} = lessonsSlice.actions;

// Selectors
export const selectLessons = (state: RootState) => state.lessons.lessons;
export const selectSelectedLesson = (state: RootState) => state.lessons.selectedLesson;

// Memoized selector factories for class-specific data
// Using a cache to ensure same classId returns same memoized selector
const lessonSummarySelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonSummaryForClass = (classId: string) => {
  if (!lessonSummarySelectorsCache.has(classId)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => {
        const classLessons = lessons.filter(lesson => lesson.classId === classId);
        
        const totalLessons = classLessons.length;
        const completedLessons = classLessons.filter(l => l.statusName === 'Conducted').length;
        const scheduledLessons = classLessons.filter(l => l.statusName === 'Scheduled').length;
        const cancelledLessons = classLessons.filter(l => l.statusName === 'Cancelled').length;
        const makeupLessons = classLessons.filter(l => l.statusName === 'Make Up').length;
        const noShowLessons = classLessons.filter(l => l.statusName === 'No Show').length;
        
        // Calculate upcoming lessons (next 7 days)
        const today = new Date();
        const next7Days = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
        const upcomingLessons = classLessons.filter(l => {
          const lessonDate = new Date(l.scheduledDate);
          return l.statusName === 'Scheduled' && lessonDate >= today && lessonDate <= next7Days;
        }).length;
        
        // Find next lesson date
        const nextScheduledLesson = classLessons
          .filter(l => l.statusName === 'Scheduled' && new Date(l.scheduledDate) >= today)
          .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0];
        
        return {
          totalLessons,
          completedLessons,
          scheduledLessons,
          cancelledLessons,
          makeupLessons,
          noShowLessons,
          upcomingLessons,
          nextLessonDate: nextScheduledLesson?.scheduledDate || null,
        };
      }
    );
    lessonSummarySelectorsCache.set(classId, selector);
  }
  return lessonSummarySelectorsCache.get(classId)!;
};

export const selectLessonsLoading = (state: RootState) => state.lessons.loadingStates.fetchingLessons;
export const selectLessonLoading = (state: RootState) => state.lessons.loadingStates.fetchingLesson;
export const selectCreatingLesson = (state: RootState) => state.lessons.loadingStates.creatingLesson;
export const selectCancellingLesson = (state: RootState) => state.lessons.loadingStates.cancellingLesson;
export const selectConductingLesson = (state: RootState) => state.lessons.loadingStates.conductingLesson;
export const selectGeneratingLessons = (state: RootState) => state.lessons.loadingStates.generatingLessons;

export const selectLessonsError = (state: RootState) => state.lessons.error;
export const selectLessonsFilters = (state: RootState) => state.lessons.filters;
export const selectLessonsViewMode = (state: RootState) => state.lessons.viewMode;
export const selectLessonsDateRange = (state: RootState) => state.lessons.dateRange;

export const selectTodayLessons = (state: RootState) => state.lessons.todayLessons;
export const selectUpcomingLessons = (state: RootState) => state.lessons.upcomingLessons;
export const selectLastGenerationResult = (state: RootState) => state.lessons.lastGenerationResult;

// Memoized parameterized selectors with caching
const lessonsForClassSelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonsForClass = (classId: string) => {
  if (!lessonsForClassSelectorsCache.has(classId)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => lessons.filter(lesson => lesson.classId === classId)
    );
    lessonsForClassSelectorsCache.set(classId, selector);
  }
  return lessonsForClassSelectorsCache.get(classId)!;
};

const lessonsByStatusSelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonsByStatus = (status: LessonStatusName) => {
  if (!lessonsByStatusSelectorsCache.has(status)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => lessons.filter(lesson => lesson.statusName === status)
    );
    lessonsByStatusSelectorsCache.set(status, selector);
  }
  return lessonsByStatusSelectorsCache.get(status)!;
};

export const selectSelectedLessons = createSelector(
  [selectLessons],
  (lessons) => lessons.filter(lesson => lesson.isSelected)
);

const lessonsInDateRangeSelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonsInDateRange = (startDate: string, endDate: string) => {
  const cacheKey = `${startDate}-${endDate}`;
  if (!lessonsInDateRangeSelectorsCache.has(cacheKey)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => lessons.filter(lesson => 
        lesson.scheduledDate >= startDate && lesson.scheduledDate <= endDate
      )
    );
    lessonsInDateRangeSelectorsCache.set(cacheKey, selector);
  }
  return lessonsInDateRangeSelectorsCache.get(cacheKey)!;
};

const lessonsByTeacherSelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonsByTeacher = (teacherId: string) => {
  if (!lessonsByTeacherSelectorsCache.has(teacherId)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => lessons.filter(lesson => lesson.teacherId === teacherId)
    );
    lessonsByTeacherSelectorsCache.set(teacherId, selector);
  }
  return lessonsByTeacherSelectorsCache.get(teacherId)!;
};

const lessonsByClassroomSelectorsCache = new Map<string, ReturnType<typeof createSelector>>();

export const selectLessonsByClassroom = (classroomId: string) => {
  if (!lessonsByClassroomSelectorsCache.has(classroomId)) {
    const selector = createSelector(
      [selectLessons],
      (lessons) => lessons.filter(lesson => lesson.classroomId === classroomId)
    );
    lessonsByClassroomSelectorsCache.set(classroomId, selector);
  }
  return lessonsByClassroomSelectorsCache.get(classroomId)!;
};

// Aggregated selectors (memoized to prevent unnecessary rerenders)
export const selectLessonCounts = createSelector(
  [selectLessons],
  (lessons) => ({
    total: lessons.length,
    scheduled: lessons.filter(l => l.statusName === 'Scheduled').length,
    conducted: lessons.filter(l => l.statusName === 'Conducted').length,
    cancelled: lessons.filter(l => l.statusName === 'Cancelled').length,
    makeUp: lessons.filter(l => l.statusName === 'Make Up').length,
    noShow: lessons.filter(l => l.statusName === 'No Show').length,
  })
);

export const selectIsAnyLessonLoading = (state: RootState) => {
  const loading = state.lessons.loadingStates;
  return Object.values(loading).some(isLoading => isLoading);
};

export default lessonsSlice.reducer;

