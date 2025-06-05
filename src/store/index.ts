
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import classesReducer from './slices/classesSlice';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import classroomsReducer from './slices/classroomsSlice';
import attendanceReducer from './slices/attendanceSlice';
import financeReducer from './slices/financeSlice';
import schedulingReducer from './slices/schedulingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    classes: classesReducer,
    students: studentsReducer,
    teachers: teachersReducer,
    classrooms: classroomsReducer,
    attendance: attendanceReducer,
    finance: financeReducer,
    scheduling: schedulingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
