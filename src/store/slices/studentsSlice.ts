
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
}

const initialState: StudentsState = {
  students: [],
  loading: false,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setStudents, addStudent, updateStudent, deleteStudent, setLoading } = studentsSlice.actions;
export default studentsSlice.reducer;
