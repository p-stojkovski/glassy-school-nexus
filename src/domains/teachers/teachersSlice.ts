import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TeacherStatus } from '@/types/enums';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subject: string;
  status: TeacherStatus;
  joinDate: string;
  classIds: string[];
  notes?: string;
}

interface TeachersState {
  teachers: Teacher[];
  loading: boolean;
}

const initialState: TeachersState = {
  teachers: [],
  loading: false,
};

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    setTeachers: (state, action: PayloadAction<Teacher[]>) => {
      state.teachers = action.payload;
    },
    addTeacher: (state, action: PayloadAction<Teacher>) => {
      state.teachers.push(action.payload);
    },
    updateTeacher: (state, action: PayloadAction<Teacher>) => {
      const index = state.teachers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = action.payload;
      }
    },
    deleteTeacher: (state, action: PayloadAction<string>) => {
      state.teachers = state.teachers.filter((t) => t.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  setLoading,
} = teachersSlice.actions;
export default teachersSlice.reducer;
