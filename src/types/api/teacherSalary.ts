// Teacher Salary API Types

export interface TeacherSalaryResponse {
  teacherId: string;
  teacherName: string;
  year: number;
  month: number;
  monthName: string;
  classBreakdowns: ClassSalaryBreakdownResponse[];
  adjustments: SalaryAdjustmentResponse[];
  summary: SalarySummaryResponse;
}

export interface ClassSalaryBreakdownResponse {
  classId: string;
  className: string;
  conductedLessons: number;
  cancelledLessons: number;
  makeupLessons: number;
  ratePerLesson: number;
  hoursWorked: number;
  subtotal: number;
}

export interface SalaryAdjustmentResponse {
  id: string;
  adjustmentType: 'bonus' | 'deduction';
  amount: number;
  reason: string;
  createdAt: string;
}

export interface SalarySummaryResponse {
  totalConductedLessons: number;
  totalCancelledLessons: number;
  totalMakeupLessons: number;
  totalHoursWorked: number;
  lessonsTotal: number;
  totalBonuses: number;
  totalDeductions: number;
  netTotal: number;
  classesWorked: number;
  averagePerLesson: number;
}

export interface SalaryAdjustmentsResponse {
  adjustments: SalaryAdjustmentResponse[];
}

// Request types
export interface CreateSalaryAdjustmentRequest {
  year: number;
  month: number;
  adjustmentType: 'bonus' | 'deduction';
  amount: number;
  reason: string;
}

export interface UpdateSalaryAdjustmentRequest {
  adjustmentType?: 'bonus' | 'deduction';
  amount?: number;
  reason?: string;
}

// Query params
export interface TeacherSalaryQueryParams {
  year: number;
  month: number;
}

// API paths
export const TeacherSalaryApiPaths = {
  SALARY: (teacherId: string) => `/api/teachers/${teacherId}/salary`,
  ADJUSTMENTS: (teacherId: string) => `/api/teachers/${teacherId}/salary-adjustments`,
  ADJUSTMENT_BY_ID: (teacherId: string, id: string) => 
    `/api/teachers/${teacherId}/salary-adjustments/${id}`,
} as const;
