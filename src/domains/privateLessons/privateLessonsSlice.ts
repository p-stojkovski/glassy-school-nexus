import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import {
  PrivateLessonStatus,
  PaymentMethod,
  ObligationStatus,
} from '@/types/enums';

export interface PaymentObligation {
  id: string;
  amount: number;
  dueDate: string; // ISO date string
  notes?: string;
  status: ObligationStatus;
  createdAt: string; // ISO datetime
}

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string; // ISO date string
  method: PaymentMethod;
  notes?: string;
  createdAt: string; // ISO datetime
}

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
  // Payment-related fields
  paymentObligation?: PaymentObligation;
  paymentRecords: PaymentRecord[];
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
const loadInitialLessons = (): PrivateLesson[] => {
  const lessons = loadFromStorage<PrivateLesson[]>('privateLessons') || [];

  // Ensure all lessons have payment fields (migration for existing data)
  return lessons.map((lesson) => ({
    ...lesson,
    paymentRecords: lesson.paymentRecords || [],
  }));
};

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

    // Payment obligation management
    setPaymentObligation: (
      state,
      action: PayloadAction<{ lessonId: string; obligation: PaymentObligation }>
    ) => {
      const { lessonId, obligation } = action.payload;
      const index = state.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          paymentObligation: obligation,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    updatePaymentObligation: (
      state,
      action: PayloadAction<{ lessonId: string; obligation: PaymentObligation }>
    ) => {
      const { lessonId, obligation } = action.payload;
      const index = state.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          paymentObligation: obligation,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    removePaymentObligation: (state, action: PayloadAction<string>) => {
      const index = state.lessons.findIndex((l) => l.id === action.payload);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          paymentObligation: undefined,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage('privateLessons', state.lessons);
      }
    },

    // Payment record management
    addPaymentRecord: (
      state,
      action: PayloadAction<{ lessonId: string; payment: PaymentRecord }>
    ) => {
      const { lessonId, payment } = action.payload;
      const index = state.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          paymentRecords: [...state.lessons[index].paymentRecords, payment],
          updatedAt: new Date().toISOString(),
        };

        // Auto-update obligation status based on payments
        if (state.lessons[index].paymentObligation) {
          const totalPaid = state.lessons[index].paymentRecords.reduce(
            (sum, p) => sum + p.amount,
            0
          );
          const obligationAmount =
            state.lessons[index].paymentObligation!.amount;

          let newStatus: ObligationStatus;
          if (totalPaid >= obligationAmount) {
            newStatus = ObligationStatus.Paid;
          } else if (totalPaid > 0) {
            newStatus = ObligationStatus.Partial;
          } else {
            const dueDate = new Date(
              state.lessons[index].paymentObligation!.dueDate
            );
            const today = new Date();
            newStatus =
              today > dueDate
                ? ObligationStatus.Overdue
                : ObligationStatus.Pending;
          }

          state.lessons[index].paymentObligation!.status = newStatus;
        }

        saveToStorage('privateLessons', state.lessons);
      }
    },

    updatePaymentRecord: (
      state,
      action: PayloadAction<{ lessonId: string; payment: PaymentRecord }>
    ) => {
      const { lessonId, payment } = action.payload;
      const index = state.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        const paymentIndex = state.lessons[index].paymentRecords.findIndex(
          (p) => p.id === payment.id
        );
        if (paymentIndex !== -1) {
          state.lessons[index].paymentRecords[paymentIndex] = payment;
          state.lessons[index].updatedAt = new Date().toISOString();
          saveToStorage('privateLessons', state.lessons);
        }
      }
    },

    removePaymentRecord: (
      state,
      action: PayloadAction<{ lessonId: string; paymentId: string }>
    ) => {
      const { lessonId, paymentId } = action.payload;
      const index = state.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        state.lessons[index] = {
          ...state.lessons[index],
          paymentRecords: state.lessons[index].paymentRecords.filter(
            (p) => p.id !== paymentId
          ),
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
  setPaymentObligation,
  updatePaymentObligation,
  removePaymentObligation,
  addPaymentRecord,
  updatePaymentRecord,
  removePaymentRecord,
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

