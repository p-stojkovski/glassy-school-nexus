
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'excused';
}

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  selectedDate: string;
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  selectedDate: new Date().toISOString().split('T')[0],
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload;
    },
    addAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.records.push(action.payload);
    },
    updateAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAttendanceRecords, addAttendanceRecord, updateAttendanceRecord, setSelectedDate, setLoading } = attendanceSlice.actions;
export default attendanceSlice.reducer;
