import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { PrivateLessonStatus } from '@/types/enums';

export interface PrivateLesson {
  id: string;
  studentId: string;
  studentName: string; // For easier display
  teacherId: string;
  teacherName: string; // For easier display
  subject: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  classroomId: string;
  classroomName: string; // For easier display
  status: PrivateLessonStatus;
  notes?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

interface PrivateLessonsState {
  lessons: PrivateLesson[];
  loading: boolean;
  error: string | null;
  selectedLesson: PrivateLesson | null;
}

// Load initial data from localStorage if available
const loadInitialLessons = (): PrivateLesson[] =>
  loadFromStorage<PrivateLesson[]>('privateLessons') || [];

const initialState: PrivateLessonsState = {
  lessons: loadInitialLessons(),
  loading: false,
  error: null,
  selectedLesson: null,
};

const privateLessonsSlice = createSlice({
  name: 'privateLessons',
  initialState,
  reducers: {
    setPrivateLessons: (state, action: PayloadAction<PrivateLesson[]>) => {
      state.lessons = action.payload;
      saveToStorage('privateLessons', state.lessons);
    },

    addPrivateLesson: (state, action: PayloadAction<PrivateLesson>) => {
      state.lessons.push(action.payload);
      saveToStorage('privateLessons', state.lessons);
    },

    updatePrivateLesson: (state, action: PayloadAction<PrivateLesson>) => {
      const index = state.lessons.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.lessons[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    deletePrivateLesson: (state, action: PayloadAction<string>) => {
      state.lessons = state.lessons.filter((l) => l.id !== action.payload);
      saveToStorage('privateLessons', state.lessons);
    },

    setSelectedLesson: (state, action: PayloadAction<PrivateLesson | null>) => {
      state.selectedLesson = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Cancel a lesson (update status to cancelled)
    cancelPrivateLesson: (state, action: PayloadAction<string>) => {
      const index = state.lessons.findIndex((l) => l.id === action.payload);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          status: PrivateLessonStatus.Cancelled,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    // Complete a lesson (update status to completed)
    completePrivateLesson: (state, action: PayloadAction<string>) => {
      const index = state.lessons.findIndex((l) => l.id === action.payload);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          status: PrivateLessonStatus.Completed,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    // Clear all data (for testing/demo purposes)
    clearAllPrivateLessons: (state) => {
      state.lessons = [];
      localStorage.removeItem('privateLessons');
    },
  },
});

export const {
  setPrivateLessons,
  addPrivateLesson,
  updatePrivateLesson,
  deletePrivateLesson,
  setSelectedLesson,
  setLoading,
  setError,
  cancelPrivateLesson,
  completePrivateLesson,
  clearAllPrivateLessons,
} = privateLessonsSlice.actions;

// Selectors
export const selectAllPrivateLessons = (state: RootState) =>
  state.privateLessons.lessons;
export const selectPrivateLessonsLoading = (state: RootState) =>
  state.privateLessons.loading;
export const selectPrivateLessonsError = (state: RootState) =>
  state.privateLessons.error;
export const selectSelectedLesson = (state: RootState) =>
  state.privateLessons.selectedLesson;

// Filter selectors
export const selectLessonsByStudent = (state: RootState, studentId: string) =>
  state.privateLessons.lessons.filter(
    (lesson) => lesson.studentId === studentId
  );

export const selectLessonsByTeacher = (state: RootState, teacherId: string) =>
  state.privateLessons.lessons.filter(
    (lesson) => lesson.teacherId === teacherId
  );

export const selectLessonsByDate = (state: RootState, date: string) =>
  state.privateLessons.lessons.filter((lesson) => lesson.date === date);

export const selectLessonsByStatus = (
  state: RootState,
  status: PrivateLessonStatus
) => state.privateLessons.lessons.filter((lesson) => lesson.status === status);

export default privateLessonsSlice.reducer;
