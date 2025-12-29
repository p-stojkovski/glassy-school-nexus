/**
 * Student filtering utilities for ClassStudentsTab
 * Frontend-only filtering for small datasets (max 15 students per class)
 */

import { StudentLessonSummary } from '@/types/api/class';

export type StudentFilter = 'all' | 'needsAttention' | 'attendanceIssues' | 'paymentDue' | 'hasNotes';

export interface StudentFilterOptions {
  filter: StudentFilter;
}

/**
 * Check if student needs attention based on multiple risk factors
 * - 2+ absences
 * - Payment obligations pending
 * - Low attendance rate (< 75%)
 */
const needsAttention = (student: StudentLessonSummary): boolean => {
  const hasHighAbsences = student.attendance.absent >= 2;
  const hasPaymentIssues = student.paymentObligation?.hasPendingObligations ?? false;
  const attendanceRate = student.totalLessons > 0
    ? student.attendance.present / student.totalLessons
    : 1;
  const lowAttendanceRate = attendanceRate < 0.75 && student.totalLessons >= 4; // Only flag if at least 4 lessons

  return hasHighAbsences || hasPaymentIssues || lowAttendanceRate;
};

/**
 * Check if student has any attendance issues
 * - Any absences or lates
 */
const hasAttendanceIssues = (student: StudentLessonSummary): boolean => {
  return student.attendance.absent > 0 || student.attendance.late > 0;
};

/**
 * Check if student has pending payment obligations
 */
const hasPaymentDue = (student: StudentLessonSummary): boolean => {
  return student.paymentObligation?.hasPendingObligations ?? false;
};

/**
 * Check if student has teacher notes/comments
 */
const hasNotes = (student: StudentLessonSummary): boolean => {
  return student.commentsCount > 0;
};

/**
 * Apply filter to a list of students
 * Pure function - does not mutate input
 */
export const applyStudentFilter = (
  students: StudentLessonSummary[],
  filterOptions: StudentFilterOptions
): StudentLessonSummary[] => {
  const { filter } = filterOptions;

  if (filter === 'all') {
    return students;
  }

  return students.filter(student => {
    switch (filter) {
      case 'needsAttention':
        return needsAttention(student);
      case 'attendanceIssues':
        return hasAttendanceIssues(student);
      case 'paymentDue':
        return hasPaymentDue(student);
      case 'hasNotes':
        return hasNotes(student);
      default:
        return true;
    }
  });
};

/**
 * Get count of students matching each filter
 * Useful for showing counts in filter UI
 */
export const getFilterCounts = (students: StudentLessonSummary[]) => {
  return {
    all: students.length,
    needsAttention: students.filter(needsAttention).length,
    attendanceIssues: students.filter(hasAttendanceIssues).length,
    paymentDue: students.filter(hasPaymentDue).length,
    hasNotes: students.filter(hasNotes).length,
  };
};
