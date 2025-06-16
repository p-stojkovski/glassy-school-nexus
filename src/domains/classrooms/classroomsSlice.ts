import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import { mockDataService } from '@/data/MockDataService';
import { ClassroomStatus } from '@/types/enums';

export interface Classroom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: ClassroomStatus;
  createdDate: string;
  lastUpdated: string;
}

interface ClassroomsState {
  classrooms: Classroom[];
  loading: boolean;
  selectedClassroom: Classroom | null;
  searchQuery: string;
  filterBy: 'all' | ClassroomStatus;
}

// Load initial classrooms from localStorage if available
const loadInitialClassrooms = (): Classroom[] =>
  loadFromStorage<Classroom[]>('classrooms') || [];

const initialState: ClassroomsState = {
  classrooms: loadInitialClassrooms(),
  loading: false,
  selectedClassroom: null,
  searchQuery: '',
  filterBy: 'all',
};

const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      mockDataService
        .saveDomainData('classrooms', state.classrooms)
        .catch((e) => {
          console.error('Failed to save classrooms to localStorage', e);
        });
    },
    addClassroom: (state, action: PayloadAction<Classroom>) => {
      state.classrooms.unshift(action.payload);
      mockDataService
        .saveDomainData('classrooms', state.classrooms)
        .catch((e) => {
          console.error('Failed to save classrooms to localStorage', e);
        });
    },
    updateClassroom: (state, action: PayloadAction<Classroom>) => {
      const index = state.classrooms.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.classrooms[index] = action.payload;
        mockDataService
          .saveDomainData('classrooms', state.classrooms)
          .catch((e) => {
            console.error('Failed to save classrooms to localStorage', e);
          });
      }
    },
    deleteClassroom: (state, action: PayloadAction<string>) => {
      state.classrooms = state.classrooms.filter(
        (c) => c.id !== action.payload
      );
      mockDataService
        .saveDomainData('classrooms', state.classrooms)
        .catch((e) => {
          console.error('Failed to save classrooms to localStorage', e);
        });
    },
    setSelectedClassroom: (state, action: PayloadAction<Classroom | null>) => {
      state.selectedClassroom = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterBy: (state, action: PayloadAction<'all' | ClassroomStatus>) => {
      state.filterBy = action.payload;
    },
    resetDemoClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      saveToStorage('classrooms', state.classrooms);
    },
  },
});

export const {
  setClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  setSelectedClassroom,
  setLoading,
  setSearchQuery,
  setFilterBy,
  resetDemoClassrooms,
} = classroomsSlice.actions;
export default classroomsSlice.reducer;
