
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Classroom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdDate: string;
  lastUpdated: string;
}

interface ClassroomsState {
  classrooms: Classroom[];
  loading: boolean;
  selectedClassroom: Classroom | null;
  searchQuery: string;
  filterBy: 'all' | 'active' | 'inactive' | 'maintenance';
}

const initialState: ClassroomsState = {
  classrooms: [],
  loading: false,
  selectedClassroom: null,
  searchQuery: '',
  filterBy: 'all',
};


// Helpers for localStorage persistence
const STORAGE_KEY = 'classrooms';
function saveToStorage(classrooms: Classroom[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
  } catch (error) {
    console.error('Failed to save classrooms to localStorage', error);
  }
}
function loadFromStorage(): Classroom[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load classrooms from localStorage', error);
  }
  return null;
}

const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      saveToStorage(state.classrooms);
    },
    addClassroom: (state, action: PayloadAction<Classroom>) => {
      state.classrooms.unshift(action.payload);
      saveToStorage(state.classrooms);
    },
    updateClassroom: (state, action: PayloadAction<Classroom>) => {
      const index = state.classrooms.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classrooms[index] = action.payload;
        saveToStorage(state.classrooms);
      }
    },
    deleteClassroom: (state, action: PayloadAction<string>) => {
      state.classrooms = state.classrooms.filter(c => c.id !== action.payload);
      saveToStorage(state.classrooms);
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
    setFilterBy: (state, action: PayloadAction<'all' | 'active' | 'inactive' | 'maintenance'>) => {
      state.filterBy = action.payload;
    },
    resetDemoClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
      saveToStorage(state.classrooms);
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
  resetDemoClassrooms
} = classroomsSlice.actions;
export { loadFromStorage };
export default classroomsSlice.reducer;
