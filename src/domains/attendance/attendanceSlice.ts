
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { AttendanceStatus } from '@/types/enums';

export interface StudentAttendance {
  studentId: string;
  studentName: string; // For easier display without extra lookups
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  sessionDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  studentRecords: StudentAttendance[];
}

export interface BasicAttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
}

interface AttendanceState {
  records: BasicAttendanceRecord[]; // Keep for backward compatibility
  attendanceRecords: AttendanceRecord[]; // New enhanced records
  currentRecord: AttendanceRecord | null;
  loading: boolean;
  error: string | null;
  selectedDate: string;
}

// Initialize state from localStorage if available
const loadInitialState = (): AttendanceRecord[] =>
  loadFromStorage<AttendanceRecord[]>('attendance-records') || [];

const initialState: AttendanceState = {
  records: [], // Keep for backward compatibility
  attendanceRecords: loadInitialState(),
  currentRecord: null,
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Keep legacy reducers for backward compatibility
    setAttendanceRecords: (state, action: PayloadAction<BasicAttendanceRecord[]>) => {
      state.records = action.payload;
    },
    addAttendanceRecord: (state, action: PayloadAction<BasicAttendanceRecord>) => {
      state.records.push(action.payload);
    },
    updateAttendanceRecord: (state, action: PayloadAction<BasicAttendanceRecord>) => {
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
    
    // New enhanced reducers for the attendance management feature
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Create a new detailed attendance record
    createAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.attendanceRecords.push(action.payload);
      saveToStorage('attendance-records', state.attendanceRecords);
    },
    
    // Update an existing detailed attendance record
    updateDetailedAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.attendanceRecords.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.attendanceRecords[index] = action.payload;
        saveToStorage('attendance-records', state.attendanceRecords);
      }
    },
    
    // Delete an attendance record
    deleteAttendanceRecord: (state, action: PayloadAction<string>) => {
      state.attendanceRecords = state.attendanceRecords.filter(record => record.id !== action.payload);
      saveToStorage('attendance-records', state.attendanceRecords);
    },
    
    // Set the current attendance record being viewed/edited
    setCurrentRecord: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.currentRecord = action.payload;
    },
    
    // Update a student's attendance status within the current record
    updateStudentAttendance: (
      state, 
      action: PayloadAction<{
        recordId: string,
        studentId: string,
        status: AttendanceStatus,
        notes?: string
      }>
    ) => {
      const { recordId, studentId, status, notes } = action.payload;
      const recordIndex = state.attendanceRecords.findIndex(record => record.id === recordId);
      
      if (recordIndex !== -1) {
        const studentIndex = state.attendanceRecords[recordIndex].studentRecords.findIndex(
          sr => sr.studentId === studentId
        );
        
        if (studentIndex !== -1) {
          state.attendanceRecords[recordIndex].studentRecords[studentIndex].status = status;
          if (notes !== undefined) {
            state.attendanceRecords[recordIndex].studentRecords[studentIndex].notes = notes;
          }
          
          // Also update current record if it's the one being edited
          if (state.currentRecord?.id === recordId) {
            const currentStudentIndex = state.currentRecord.studentRecords.findIndex(
              sr => sr.studentId === studentId
            );
            if (currentStudentIndex !== -1) {
              state.currentRecord.studentRecords[currentStudentIndex].status = status;
              if (notes !== undefined) {
                state.currentRecord.studentRecords[currentStudentIndex].notes = notes;
              }
            }
          }
          
          // Update localStorage
          saveToStorage('attendance-records', state.attendanceRecords);
        }
      }
    },
    
    // Clear all attendance data (for testing/demo purposes)
    clearAllAttendance: (state) => {
      state.attendanceRecords = [];
      state.currentRecord = null;
      localStorage.removeItem('attendance-records');
    }
  },
});

// Export actions
export const { 
  // Legacy actions
  setAttendanceRecords, 
  addAttendanceRecord, 
  updateAttendanceRecord, 
  setSelectedDate, 
  setLoading,
  
  // New enhanced actions
  setError,
  createAttendanceRecord,
  updateDetailedAttendanceRecord,
  deleteAttendanceRecord,
  setCurrentRecord,
  updateStudentAttendance,
  clearAllAttendance
} = attendanceSlice.actions;

// Selectors
export const selectAllAttendanceRecords = (state: RootState) => state.attendance.attendanceRecords;
export const selectAttendanceLoading = (state: RootState) => state.attendance.loading;
export const selectAttendanceError = (state: RootState) => state.attendance.error;
export const selectCurrentRecord = (state: RootState) => state.attendance.currentRecord;
export const selectSelectedDate = (state: RootState) => state.attendance.selectedDate;
export const selectAttendanceByClassId = (state: RootState, classId: string) => 
  state.attendance.attendanceRecords.filter(record => record.classId === classId);
export const selectAttendanceByDate = (state: RootState, date: string) =>
  state.attendance.attendanceRecords.filter(record => record.sessionDate === date);

export default attendanceSlice.reducer;
