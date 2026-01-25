import { z } from 'zod';

// Break types enumeration
export type BreakType = 'holiday' | 'vacation' | 'exam_period';

// Academic Year interfaces
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  isActive: boolean;
  semesterCount?: number;
}

export interface CreateAcademicYearRequest {
  name: string;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  isActive?: boolean;
}

export interface UpdateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Semester interfaces
export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  semesterNumber: number;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  teachingDays?: number;
}

export interface CreateSemesterRequest {
  name: string;
  semesterNumber: number;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
}

export interface UpdateSemesterRequest {
  name: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
}

// Teaching Break interfaces
export interface TeachingBreak {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  breakType: BreakType;
  notes?: string;
}

export interface CreateTeachingBreakRequest {
  name: string;
  startDate: string; // yyyy-MM-dd format
  endDate: string;   // yyyy-MM-dd format
  breakType: BreakType;
  notes?: string;
}

export interface UpdateTeachingBreakRequest {
  name: string;
  startDate: string;
  endDate: string;
  breakType: BreakType;
  notes?: string;
}

// Public Holiday interfaces removed — use TeachingBreak with breakType = 'holiday' instead

// Utility interfaces
export interface NonTeachingDatesResponse {
  yearId: string;
  from: string;
  to: string;
  breaks: Array<{
    name: string;
    startDate: string;
    endDate: string;
    breakType: BreakType;
  }>;
  holidays: Array<{
    name: string;
    date: string;
  }>;
}

export interface TeachingDaysCountResponse {
  yearId: string;
  from: string;
  to: string;
  totalDays: number;
  nonTeachingDays: number;
  teachingDays: number;
}

export interface SemesterSummaryResponse {
  id: string;
  academicYearId: string;
  name: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  teachingDays: number;
  nonTeachingDates: {
    breaks: Array<{
      name: string;
      startDate: string;
      endDate: string;
      breakType: BreakType;
    }>;
    holidays: Array<{
      name: string;
      date: string;
    }>;
  };
}

// Form validation schemas
export const academicYearFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be ≤100 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
  isActive: z.boolean().default(false),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const semesterFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be ≤50 characters'),
  semesterNumber: z
    .number()
    .min(1, 'Semester number must be ≥ 1'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const teachingBreakFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be ≤100 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)'),
  breakType: z.enum(['holiday', 'vacation', 'exam_period'], {
    required_error: 'Break type is required',
  }),
  notes: z.string().max(500, 'Notes must be ≤500 characters').optional(),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// Public holiday form schema removed — use TeachingBreak form with breakType = 'holiday'

// Form data types (inferred from schemas)
export type AcademicYearFormData = z.infer<typeof academicYearFormSchema>;
export type SemesterFormData = z.infer<typeof semesterFormSchema>;
export type TeachingBreakFormData = z.infer<typeof teachingBreakFormSchema>;
// PublicHolidayFormData removed

// Break type display labels
export const breakTypeLabels: Record<BreakType, string> = {
  holiday: 'Holiday',
  vacation: 'Vacation',
  exam_period: 'Exam Period',
};

// Break type colors for UI
export const breakTypeColors: Record<BreakType, string> = {
  holiday: 'bg-red-500/20 text-red-300 border-red-500/30',
  vacation: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  exam_period: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

