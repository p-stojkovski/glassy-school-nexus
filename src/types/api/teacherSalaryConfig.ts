// Teacher Salary Configuration API Types

export interface TeacherSalaryConfigResponse {
  id: string;
  teacherId: string;
  grossSalary: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherSalaryConfigHistoryResponse {
  currentSalary: TeacherSalaryConfigResponse | null;
  history: TeacherSalaryConfigResponse[];
}

export interface SetTeacherSalaryConfigRequest {
  grossSalary: number;
  academicYearId: string;
  effectiveFrom?: string;
  notes?: string;
}

export interface UpdateTeacherSalaryConfigRequest {
  grossSalary?: number;
  notes?: string;
}

// API paths
export const TeacherSalaryConfigApiPaths = {
  CONFIG: (teacherId: string) => `/api/teachers/${teacherId}/salary-config`,
  CONFIG_BY_ID: (teacherId: string, configId: string) =>
    `/api/teachers/${teacherId}/salary-config/${configId}`,
} as const;

// Validation Constants
export const SALARY_CONFIG_VALIDATION = {
  MIN_GROSS_SALARY: 1,
  MAX_GROSS_SALARY: 9999999.99,
  MAX_NOTES_LENGTH: 500,
} as const;
