import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadFromStorage } from '@/lib/storage';
import { mockDataService } from '@/data/MockDataService';

export interface Class {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
    subject: string;
  };
  room: string;
  roomId?: string; // Store reference to classroom ID
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  students: number;
  studentIds: string[]; // Store assigned student IDs
  subject: string;
  description: string;
  requirements: string;
  objectives: string[];
  materials: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClassesState {
  classes: Class[];
  loading: boolean;
  selectedClass: Class | null;
}

// Load initial class data from localStorage if available
const loadInitialClasses = (): Class[] =>
  loadFromStorage<Class[]>('classes') || [];

const initialState: ClassesState = {
  classes: loadInitialClasses(),
  loading: false,
  selectedClass: null,
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setClasses: (state, action: PayloadAction<Class[]>) => {
      state.classes = action.payload;
      mockDataService.saveDomainData('classes', state.classes).catch((e) => {
        console.error('Failed to save classes to localStorage', e);
      });
    },
    addClass: (state, action: PayloadAction<Class>) => {
      state.classes.push(action.payload);
      mockDataService.saveDomainData('classes', state.classes).catch((e) => {
        console.error('Failed to save classes to localStorage', e);
      });
    },
    updateClass: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Class> }>
    ) => {
      const index = state.classes.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = {
          ...state.classes[index],
          ...action.payload.updates,
        };
        mockDataService.saveDomainData('classes', state.classes).catch((e) => {
          console.error('Failed to save classes to localStorage', e);
        });
      }
    },
    deleteClass: (state, action: PayloadAction<string>) => {
      state.classes = state.classes.filter((c) => c.id !== action.payload);
      mockDataService.saveDomainData('classes', state.classes).catch((e) => {
        console.error('Failed to save classes to localStorage', e);
      });
    },
    setSelectedClass: (state, action: PayloadAction<Class | null>) => {
      state.selectedClass = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setClasses,
  addClass,
  updateClass,
  deleteClass,
  setSelectedClass,
  setLoading,
} = classesSlice.actions;
export default classesSlice.reducer;
