
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  classId: string;
  status: 'active' | 'inactive';
  joinDate: string;
  parentContact: string;
  paymentDue?: boolean;
  lastPayment?: string;
}

interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

// Load initial student data from localStorage if available
const loadInitialStudents = (): Student[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load students from localStorage', e);
    return [];
  }
};

const initialState: StudentsState = {
  students: loadInitialStudents(),
  loading: false,
  error: null,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
      try {
        localStorage.setItem('students', JSON.stringify(action.payload));
      } catch (e) {
        state.error = 'Failed to save students to local storage';
        console.error('Failed to save students to localStorage', e);
      }
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
      try {
        localStorage.setItem('students', JSON.stringify(state.students));
      } catch (e) {
        state.error = 'Failed to save student to local storage';
        console.error('Failed to save student to localStorage', e);
      }
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
        try {
          localStorage.setItem('students', JSON.stringify(state.students));
        } catch (e) {
          state.error = 'Failed to save student updates to local storage';
          console.error('Failed to save student updates to localStorage', e);
        }
      }
    },
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(s => s.id !== action.payload);
      try {
        localStorage.setItem('students', JSON.stringify(state.students));
      } catch (e) {
        state.error = 'Failed to update local storage after deletion';
        console.error('Failed to update localStorage after deletion', e);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAllStudentData: (state) => {
      state.students = [];
      try {
        localStorage.removeItem('students');
      } catch (e) {
        state.error = 'Failed to clear student data from local storage';
        console.error('Failed to clear student data from localStorage', e);
      }
    },
  },
});

export const { 
  setStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  setLoading, 
  setError,
  clearAllStudentData 
} = studentsSlice.actions;

// Selectors
export const selectStudents = (state: { students: StudentsState }) => state.students.students;
export const selectLoading = (state: { students: StudentsState }) => state.students.loading;
export const selectError = (state: { students: StudentsState }) => state.students.error;

export default studentsSlice.reducer;
