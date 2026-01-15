import api from './api';
import type {
  TeacherBaseSalaryResponse,
  TeacherBaseSalaryHistoryResponse,
  SetTeacherBaseSalaryRequest,
} from '@/types/api/teacherBaseSalary';

/**
 * Teacher Base Salary API Service
 * 
 * Handles API calls for managing teacher base salaries.
 * Base salary is NET (not gross) and versioned per academic year.
 */
export const teacherBaseSalaryService = {
  /**
   * Get current base salary for a teacher in a specific academic year
   */
  getBaseSalary: async (teacherId: string, academicYearId: string) => {
    return api.get<TeacherBaseSalaryResponse>(
      `/api/teachers/${teacherId}/base-salary?academicYearId=${academicYearId}`
    );
  },

  /**
   * Get base salary history for a teacher in a specific academic year
   */
  getBaseSalaryHistory: async (teacherId: string, academicYearId: string) => {
    return api.get<TeacherBaseSalaryHistoryResponse>(
      `/api/teachers/${teacherId}/base-salary/history?academicYearId=${academicYearId}`
    );
  },

  /**
   * Set or update base salary for a teacher
   * Creates new version and deactivates previous one
   */
  setBaseSalary: async (teacherId: string, request: SetTeacherBaseSalaryRequest) => {
    return api.post<TeacherBaseSalaryResponse>(
      `/api/teachers/${teacherId}/base-salary`,
      request
    );
  },
};
