
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

const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload;
    },
    addClassroom: (state, action: PayloadAction<Classroom>) => {
      state.classrooms.unshift(action.payload);
    },
    updateClassroom: (state, action: PayloadAction<Classroom>) => {
      const index = state.classrooms.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classrooms[index] = action.payload;
      }
    },
    deleteClassroom: (state, action: PayloadAction<string>) => {
      state.classrooms = state.classrooms.filter(c => c.id !== action.payload);
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
  setFilterBy
} = classroomsSlice.actions;
export default classroomsSlice.reducer;
