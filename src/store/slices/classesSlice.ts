
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Class {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
    avatar: string;
    subject: string;
  };
  room: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'pending';
  students: number;
  maxStudents: number;
  subject: string;
  level: string;
  price: number;
  duration: number;
  description: string;
  requirements: string;
  objectives: string[];
  materials: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
}

interface ClassesState {
  classes: Class[];
  loading: boolean;
  selectedClass: Class | null;
}

const initialState: ClassesState = {
  classes: [],
  loading: false,
  selectedClass: null,
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setClasses: (state, action: PayloadAction<Class[]>) => {
      state.classes = action.payload;
    },
    addClass: (state, action: PayloadAction<Class>) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action: PayloadAction<{ id: string; updates: Partial<Class> }>) => {
      const index = state.classes.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = { ...state.classes[index], ...action.payload.updates };
      }
    },
    deleteClass: (state, action: PayloadAction<string>) => {
      state.classes = state.classes.filter(c => c.id !== action.payload);
    },
    setSelectedClass: (state, action: PayloadAction<Class | null>) => {
      state.selectedClass = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setClasses, addClass, updateClass, deleteClass, setSelectedClass, setLoading } = classesSlice.actions;
export default classesSlice.reducer;
