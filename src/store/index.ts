import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/domains/auth/authSlice';
import uiReducer from './slices/uiSlice';
import classesReducer from '@/domains/classes/classesSlice';
import studentsReducer from '@/domains/students/studentsSlice';
import teachersReducer from '@/domains/teachers/teachersSlice';
import classroomsReducer from '@/domains/classrooms/classroomsSlice';
import attendanceReducer from '@/domains/attendance/attendanceSlice';
import financeReducer from '@/domains/finance/financeSlice';
import gradesReducer from '@/domains/grades/gradesSlice';
import privateLessonsReducer from '@/domains/privateLessons/privateLessonsSlice';
import lessonsReducer from '@/domains/lessons/lessonsSlice';
import homeworkReducer from './slices/homeworkSlice';

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
    grades: gradesReducer,
    privateLessons: privateLessonsReducer,
    lessons: lessonsReducer,
    homework: homeworkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

