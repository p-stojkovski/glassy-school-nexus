
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import classesSlice from './slices/classesSlice';
import studentsSlice from './slices/studentsSlice';
import teachersSlice from './slices/teachersSlice';
import attendanceSlice from './slices/attendanceSlice';
import financeSlice from './slices/financeSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    classes: classesSlice,
    students: studentsSlice,
    teachers: teachersSlice,
    attendance: attendanceSlice,
    finance: financeSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
