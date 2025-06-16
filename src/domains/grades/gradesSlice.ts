import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the types for our data
export type AssessmentType =
  | 'Homework'
  | 'Test'
  | 'Quiz'
  | 'Project'
  | 'Participation'
  | string;

export interface Assessment {
  id: string;
  classId: string;
  className: string; // For easier display
  title: string;
  type: AssessmentType;
  totalPoints?: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string; // For easier display
  value: number | string; // Can be numeric (90) or letter ('A')
  comments?: string;
  dateRecorded: string;
}

interface GradesState {
  assessments: Assessment[];
  grades: Grade[];
  loading: boolean;
  error: string | null;
  selectedAssessmentId: string | null;
  selectedClassId: string | null;
}

// Load initial data from localStorage if available
const loadInitialAssessments = (): Assessment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('assessments');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load assessments from localStorage', e);
    return [];
  }
};

const loadInitialGrades = (): Grade[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('grades');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load grades from localStorage', e);
    return [];
  }
};

const initialState: GradesState = {
  assessments: loadInitialAssessments(),
  grades: loadInitialGrades(),
  loading: false,
  error: null,
  selectedAssessmentId: null,
  selectedClassId: null,
};

export const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setSelectedAssessment: (state, action: PayloadAction<string | null>) => {
      state.selectedAssessmentId = action.payload;
    },

    setSelectedClass: (state, action: PayloadAction<string | null>) => {
      state.selectedClassId = action.payload;
    },

    // Assessment CRUD operations
    createAssessment: (state, action: PayloadAction<Assessment>) => {
      state.assessments.push(action.payload);
      localStorage.setItem('assessments', JSON.stringify(state.assessments));
    },

    updateAssessment: (state, action: PayloadAction<Assessment>) => {
      const index = state.assessments.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.assessments[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('assessments', JSON.stringify(state.assessments));
      }
    },

    deleteAssessment: (state, action: PayloadAction<string>) => {
      state.assessments = state.assessments.filter(
        (a) => a.id !== action.payload
      );
      // Also delete related grades
      state.grades = state.grades.filter(
        (g) => g.assessmentId !== action.payload
      );
      localStorage.setItem('assessments', JSON.stringify(state.assessments));
      localStorage.setItem('grades', JSON.stringify(state.grades));
    },

    // Grade CRUD operations
    addGrade: (state, action: PayloadAction<Grade>) => {
      state.grades.push(action.payload);
      localStorage.setItem('grades', JSON.stringify(state.grades));
    },

    updateGrade: (state, action: PayloadAction<Grade>) => {
      const index = state.grades.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.grades[index] = action.payload;
        localStorage.setItem('grades', JSON.stringify(state.grades));
      }
    },

    deleteGrade: (state, action: PayloadAction<string>) => {
      state.grades = state.grades.filter((g) => g.id !== action.payload);
      localStorage.setItem('grades', JSON.stringify(state.grades));
    },

    // Add grades in batch
    addGradesBatch: (state, action: PayloadAction<Grade[]>) => {
      state.grades = [...state.grades, ...action.payload];
      localStorage.setItem('grades', JSON.stringify(state.grades));
    },

    // Clear all data (for testing/demo purposes)
    clearAllGradeData: (state) => {
      state.assessments = [];
      state.grades = [];
      localStorage.removeItem('assessments');
      localStorage.removeItem('grades');
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setSelectedAssessment,
  setSelectedClass,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  addGrade,
  updateGrade,
  deleteGrade,
  addGradesBatch,
  clearAllGradeData,
} = gradesSlice.actions;

// Selectors
export const selectAllAssessments = (state: RootState) =>
  state.grades.assessments;
export const selectAllGrades = (state: RootState) => state.grades.grades;
export const selectLoading = (state: RootState) => state.grades.loading;
export const selectError = (state: RootState) => state.grades.error;
export const selectSelectedAssessmentId = (state: RootState) =>
  state.grades.selectedAssessmentId;
export const selectSelectedClassId = (state: RootState) =>
  state.grades.selectedClassId;

export const selectAssessmentsByClassId = (state: RootState, classId: string) =>
  state.grades.assessments.filter(
    (assessment) => assessment.classId === classId
  );

export const selectGradesByAssessmentId = (
  state: RootState,
  assessmentId: string
) => state.grades.grades.filter((grade) => grade.assessmentId === assessmentId);

export const selectGradesByStudentId = (state: RootState, studentId: string) =>
  state.grades.grades.filter((grade) => grade.studentId === studentId);

export const selectGradesByClassId = (state: RootState, classId: string) => {
  const assessmentIds = state.grades.assessments
    .filter((assessment) => assessment.classId === classId)
    .map((assessment) => assessment.id);

  return state.grades.grades.filter((grade) =>
    assessmentIds.includes(grade.assessmentId)
  );
};

export default gradesSlice.reducer;
