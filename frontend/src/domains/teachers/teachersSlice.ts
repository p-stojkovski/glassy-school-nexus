import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockDataService } from '@/data/MockDataService';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  subject: string;
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
      mockDataService.saveDomainData('teachers', state.teachers).catch((e) => {
        console.error('Failed to save teachers to localStorage', e);
      });
    },
    addTeacher: (state, action: PayloadAction<Teacher>) => {
      state.teachers.push(action.payload);
      mockDataService.saveDomainData('teachers', state.teachers).catch((e) => {
        console.error('Failed to save teachers to localStorage', e);
      });
    },
    updateTeacher: (state, action: PayloadAction<Teacher>) => {
      const index = state.teachers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = action.payload;
        mockDataService
          .saveDomainData('teachers', state.teachers)
          .catch((e) => {
            console.error('Failed to save teachers to localStorage', e);
          });
      }
    },
    deleteTeacher: (state, action: PayloadAction<string>) => {
      state.teachers = state.teachers.filter((t) => t.id !== action.payload);
      mockDataService.saveDomainData('teachers', state.teachers).catch((e) => {
        console.error('Failed to save teachers to localStorage', e);
      });
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
