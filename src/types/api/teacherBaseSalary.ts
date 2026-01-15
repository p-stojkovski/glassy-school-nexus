// Teacher Base Salary API Types (Employment Type Feature)
// Base salary is stored as NET (not gross) and is per Academic Year

export interface TeacherBaseSalaryResponse {
  id: string;
  teacherId: string;
  academicYearId: string;
  baseNetSalary: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  changeReason: string | null;
  createdAt: string;
}

export interface TeacherBaseSalaryHistoryResponse {
  current: TeacherBaseSalaryResponse | null;
  history: TeacherBaseSalaryResponse[];
}

export interface SetTeacherBaseSalaryRequest {
  teacherId: string;
  baseNetSalary: number;
  academicYearId: string;
  effectiveFrom?: string;
  changeReason?: string;
}

// API paths
export const TeacherBaseSalaryApiPaths = {
  BASE_SALARY: (teacherId: string) => `/api/teachers/${teacherId}/base-salary`,
  BASE_SALARY_HISTORY: (teacherId: string) =>
    `/api/teachers/${teacherId}/base-salary/history`,
} as const;

// Validation Constants (matches backend TeacherBaseSalaryValidationRules)
export const BASE_SALARY_VALIDATION = {
  MIN: 1,
  MAX: 300_000,
  MAX_CHANGE_REASON_LENGTH: 500,
} as const;
