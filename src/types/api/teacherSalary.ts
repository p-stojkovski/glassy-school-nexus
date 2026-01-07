// Teacher Salary API Types - Fixed Salary Model

export interface TeacherSalaryResponse {
  teacherId: string;
  teacherName: string;
  year: number;
  month: number;
  monthName: string;
  grossSalary: GrossSalaryInfo;
  contributions: ContributionBreakdown[];
  incomeTax: TaxBreakdown;
  summary: SalarySummaryResponse;
}

export interface GrossSalaryInfo {
  amount: number;
  effectiveFrom: string;
  notes: string | null;
}

export interface ContributionBreakdown {
  code: string;
  name: string;
  nameMk: string;
  rate: number;
  amount: number;
  displayOrder: number;
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  taxableIncome: number;
  amount: number;
}

export interface SalarySummaryResponse {
  grossSalary: number;
  totalContributions: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
}

// Query params
export interface TeacherSalaryQueryParams {
  year: number;
  month: number;
}

// API paths
export const TeacherSalaryApiPaths = {
  SALARY: (teacherId: string) => `/api/teachers/${teacherId}/salary`,
} as const;
