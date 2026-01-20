/**
 * TypeScript type definitions for Student Lesson History
 * Used for expandable rows in the Lesson Teaching page
 */

// Re-export StudentLessonDetail for convenience
export { StudentLessonDetail } from './class';

/** Computed summary of a student's recent lesson history */
export interface StudentHistorySummary {
  totalLessons: number;
  absences: number;
  lateCount: number;
  missingHomework: number;
  /** True if absences >= 3 OR missingHomework >= 3 */
  hasRisk: boolean;
}

/** State for a single expanded student row */
export interface ExpandedStudentState {
  isExpanded: boolean;
  isLoading: boolean;
  error: string | null;
  history: import('./class').StudentLessonDetail[];
  summary: StudentHistorySummary | null;
}
