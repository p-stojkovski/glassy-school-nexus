
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ScheduledClass {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  classroomId: string;
  classroomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: {
    type: 'teacher' | 'student' | 'classroom';
    id: string;
    name: string;
    conflictingSchedule: ScheduledClass;
  }[];
}

interface SchedulingState {
  scheduledClasses: ScheduledClass[];
  loading: boolean;
  selectedDate: string; // Changed from Date to string for serialization
  viewMode: 'day' | 'week' | 'month';
  filters: {
    classId?: string;
    teacherId?: string;
    classroomId?: string;
    status?: string;
  };
}

const initialState: SchedulingState = {
  scheduledClasses: [],
  loading: false,
  selectedDate: new Date().toISOString(), // Store as ISO string instead of Date object
  viewMode: 'week',
  filters: {},
};

const schedulingSlice = createSlice({
  name: 'scheduling',
  initialState,
  reducers: {
    setScheduledClasses: (state, action: PayloadAction<ScheduledClass[]>) => {
      state.scheduledClasses = action.payload;
    },
    addScheduledClass: (state, action: PayloadAction<ScheduledClass>) => {
      state.scheduledClasses.push(action.payload);
    },
    updateScheduledClass: (state, action: PayloadAction<ScheduledClass>) => {
      const index = state.scheduledClasses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.scheduledClasses[index] = action.payload;
      }
    },
    deleteScheduledClass: (state, action: PayloadAction<string>) => {
      state.scheduledClasses = state.scheduledClasses.filter(c => c.id !== action.payload);
    },    cancelScheduledClass: (state, action: PayloadAction<{ id: string; reason: string }>) => {
      const index = state.scheduledClasses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.scheduledClasses[index].status = 'canceled';
        state.scheduledClasses[index].cancelReason = action.payload.reason;
        state.scheduledClasses[index].updatedAt = new Date().toISOString();
      }
    },setSelectedDate: (state, action: PayloadAction<Date | string>) => {
      // Convert Date object to ISO string if needed
      state.selectedDate = typeof action.payload === 'string' 
        ? action.payload 
        : action.payload.toISOString();
    },
    setViewMode: (state, action: PayloadAction<'day' | 'week' | 'month'>) => {
      state.viewMode = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<SchedulingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setScheduledClasses,
  addScheduledClass,
  updateScheduledClass,
  deleteScheduledClass,
  cancelScheduledClass,
  setSelectedDate,
  setViewMode,
  setFilters,
  setLoading,
} = schedulingSlice.actions;

export default schedulingSlice.reducer;
