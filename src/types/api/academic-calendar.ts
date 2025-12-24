/**
 * TypeScript type definitions for the Academic Calendar API
 * Manages academic years, semesters, and teaching breaks
 */

// ============================================================================
// ACADEMIC YEARS
// ============================================================================

export interface CreateAcademicYearRequest {
  name: string;           // Required: unique year name
  startDate: string;      // Required: ISO 8601 date (YYYY-MM-DD)
  endDate: string;        // Required: ISO 8601 date (YYYY-MM-DD)
  isActive?: boolean;     // Optional: default false
}

export interface UpdateAcademicYearRequest {
  id: string;             // Required: GUID of year to update
  name: string;           // Required
  startDate: string;      // Required: ISO 8601 date
  endDate: string;        // Required: ISO 8601 date
  isActive: boolean;      // Required
}

export interface ActivateAcademicYearRequest {
  id: string;             // Required: GUID of year to activate
}

export interface AcademicYearResponse {
  id: string;             // GUID
  name: string;
  startDate: string;      // ISO 8601 date
  endDate: string;        // ISO 8601 date
  isActive: boolean;
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
}

export interface CreateYearResponse {
  id: string;             // GUID of created year
}

// ============================================================================
// SEMESTERS
// ============================================================================

export interface CreateAcademicSemesterRequest {
  name: string;           // Required: unique within year
  semesterNumber: number; // Required: 1-4 typically
  startDate: string;      // Required: ISO 8601 date
  endDate: string;        // Required: ISO 8601 date
}

export interface UpdateAcademicSemesterRequest {
  name: string;           // Required
  semesterNumber: number; // Required
  startDate: string;      // Required: ISO 8601 date
  endDate: string;        // Required: ISO 8601 date
}

export interface AcademicSemesterResponse {
  id: string;             // GUID
  academicYearId: string; // GUID of parent year
  name: string;
  semesterNumber: number;
  startDate: string;      // ISO 8601 date
  endDate: string;        // ISO 8601 date
  isDeleted: boolean;     // Soft delete flag
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
}

export interface CreateSemesterResponse {
  id: string;             // GUID of created semester
}

// ============================================================================
// TEACHING BREAKS
// ============================================================================

export interface CreateTeachingBreakRequest {
  name: string;           // Required: unique within year
  startDate: string;      // Required: ISO 8601 date
  endDate: string;        // Required: ISO 8601 date
  breakType?: string;     // Optional: default 'vacation'
  notes?: string;         // Optional: additional notes
}

export interface UpdateTeachingBreakRequest {
  name: string;           // Required
  startDate: string;      // Required: ISO 8601 date
  endDate: string;        // Required: ISO 8601 date
  breakType: string;      // Required
  notes?: string;         // Optional
}

export interface TeachingBreakResponse {
  id: string;             // GUID
  name: string;
  startDate: string;      // ISO 8601 date
  endDate: string;        // ISO 8601 date
  breakType: string;
  notes?: string;
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
}

export interface CreateTeachingBreakResponse {
  id: string;             // GUID of created break
}

// ============================================================================
// UTILITY MODELS
// ============================================================================

export interface NonTeachingDate {
  date: string;           // ISO 8601 date
  reason: string;         // Human-readable reason
  type: 'holiday' | 'break'; // Type of non-teaching day
}

export interface GetNonTeachingDatesResponse {
  nonTeachingDates: NonTeachingDate[];
  fromDate: string;       // ISO 8601 date
  toDate: string;         // ISO 8601 date
  totalDays: number;      // Total days in range
  nonTeachingDateCount: number; // Count of non-teaching days
}

export interface GetTeachingDaysCountResponse {
  teachingDays: number;   // Count of teaching days
  totalDays: number;      // Count of all days in range
  fromDate: string;       // ISO 8601 date
  toDate: string;         // ISO 8601 date
}

export interface BreakInSemester {
  id: string;             // GUID of break
  name: string;
  startDate: string;
  endDate: string;
  breakType: string;
}

export interface HolidayInSemester {
  date: string;           // ISO 8601 date
  reason: string;
}

export interface GetSemesterSummaryResponse {
  id: string;             // GUID of semester
  academicYearId: string; // GUID of year
  name: string;
  semesterNumber: number;
  startDate: string;      // ISO 8601 date
  endDate: string;        // ISO 8601 date
  teachingDays: number;   // Count of teaching days
  totalDays: number;      // Total days in semester
  breaksInSemester: BreakInSemester[];
  holidaysInSemester: HolidayInSemester[];
}

// ============================================================================
// ERROR CODES
// ============================================================================

export enum AcademicCalendarErrorCodes {
  ACADEMIC_YEAR_NOT_FOUND = 'academic_year_not_found',
  ACTIVE_YEAR_NOT_FOUND = 'active_year_not_found',
  ACADEMIC_YEAR_NAME_EXISTS = 'academic_year_name_exists',
  ACADEMIC_YEAR_OVERLAP = 'academic_year_overlap',
  ACADEMIC_YEAR_DATE_OVERLAPS_ACTIVE = 'academic_year_date_overlaps_active',
  ACADEMIC_YEAR_INVALID_DATE_RANGE = 'academic_year_invalid_date_range',
  ACADEMIC_YEAR_INVALID_DURATION = 'academic_year_invalid_duration',
  ACADEMIC_YEAR_HAS_DEPENDENCIES = 'academic_year_has_dependencies',
  ACADEMIC_YEARS_RETRIEVAL_ERROR = 'academic_years_retrieval_error',

  ACADEMIC_SEMESTER_NOT_FOUND = 'academic_semester_not_found',
  SEMESTER_NOT_FOUND = 'semester_not_found',
  ACADEMIC_SEMESTER_NUMBER_EXISTS = 'academic_semester_number_exists',
  SEMESTER_NUMBER_EXISTS = 'semester_number_exists',
  ACADEMIC_SEMESTER_DATE_OVERLAP = 'academic_semester_date_overlap',
  SEMESTER_DATE_OVERLAP = 'semester_date_overlap',
  ACADEMIC_SEMESTER_OUTSIDE_YEAR_BOUNDS = 'academic_semester_outside_year_bounds',
  SEMESTER_OUTSIDE_ACADEMIC_YEAR = 'semester_outside_academic_year',
  ACADEMIC_SEMESTER_INVALID_DATE_RANGE = 'academic_semester_invalid_date_range',
  ACADEMIC_SEMESTER_INVALID_NUMBER = 'academic_semester_invalid_number',
  ACADEMIC_SEMESTER_HAS_DEPENDENCIES = 'academic_semester_has_dependencies',

  TEACHING_BREAK_NOT_FOUND = 'teaching_break_not_found',
  TEACHING_BREAK_NAME_EXISTS = 'teaching_break_name_exists',
  TEACHING_BREAK_DATE_OVERLAP = 'teaching_break_date_overlap',
  TEACHING_BREAK_INVALID_DATE_RANGE = 'teaching_break_invalid_date_range',
  TEACHING_BREAK_INVALID_TYPE = 'teaching_break_invalid_type',
  TEACHING_BREAK_DATABASE_ERROR = 'teaching_break_database_error',
  TEACHING_BREAK_RETRIEVAL_ERROR = 'teaching_break_retrieval_error',
  TEACHING_BREAKS_RETRIEVAL_ERROR = 'teaching_breaks_retrieval_error',

  ACADEMIC_CALENDAR_UTILITIES_INVALID_DATE_RANGE = 'academic_calendar_utilities_invalid_date_range',
  ACADEMIC_CALENDAR_UTILITIES_DATE_RANGE_TOO_LARGE = 'academic_calendar_utilities_date_range_too_large',
  ACADEMIC_CALENDAR_UTILITIES_NON_TEACHING_DATES_ERROR = 'academic_calendar_utilities_non_teaching_dates_error',
  ACADEMIC_CALENDAR_UTILITIES_TEACHING_DAYS_ERROR = 'academic_calendar_utilities_teaching_days_error',
}

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum AcademicCalendarHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================================================
// API PATHS
// ============================================================================

export const AcademicCalendarApiPaths = {
  // Years endpoints
  YEARS_BASE: '/api/academic-calendar/years',
  YEARS_BY_ID: (id: string) => `/api/academic-calendar/years/${id}`,
  YEARS_ACTIVATE: (id: string) => `/api/academic-calendar/years/${id}/activate`,
  YEARS_ACTIVE: '/api/academic-calendar/years/active',

  // Semesters endpoints
  SEMESTERS_BASE: '/api/academic-calendar/semesters',
  SEMESTERS_BY_ID: (id: string) => `/api/academic-calendar/semesters/${id}`,
  SEMESTERS_FOR_YEAR: (yearId: string) => `/api/academic-calendar/years/${yearId}/semesters`,
  SEMESTERS_FOR_YEAR_BY_ID: (yearId: string, id: string) =>
    `/api/academic-calendar/years/${yearId}/semesters/${id}`,

  // Teaching breaks endpoints
  TEACHING_BREAKS_FOR_YEAR: (yearId: string) =>
    `/api/academic-calendar/years/${yearId}/teaching-breaks`,
  TEACHING_BREAKS_BY_ID: (id: string) =>
    `/api/academic-calendar/teaching-breaks/${id}`,

  // Utility endpoints
  NON_TEACHING_DATES: (yearId: string) =>
    `/api/academic-calendar/years/${yearId}/non-teaching-dates`,
  TEACHING_DAYS_COUNT: (yearId: string) =>
    `/api/academic-calendar/years/${yearId}/teaching-days-count`,
  SEMESTER_SUMMARY: (semesterId: string) =>
    `/api/academic-calendar/semesters/${semesterId}/summary`,
} as const;

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface GetAcademicYearsParams {
  isActiveOnly?: boolean;
  sortBy?: 'name' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

export interface GetSemestersParams {
  isActiveOnly?: boolean;
  sortBy?: 'semesterNumber' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

export interface GetNonTeachingDatesParams {
  fromDate: string;       // ISO 8601 date
  toDate: string;         // ISO 8601 date
}

export interface GetTeachingDaysCountParams {
  fromDate: string;       // ISO 8601 date
  toDate: string;         // ISO 8601 date
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAcademicYearResponse(obj: any): obj is AcademicYearResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.startDate === 'string' &&
    typeof obj.endDate === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function isAcademicSemesterResponse(obj: any): obj is AcademicSemesterResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.academicYearId === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.semesterNumber === 'number' &&
    typeof obj.startDate === 'string' &&
    typeof obj.endDate === 'string' &&
    typeof obj.isDeleted === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function isTeachingBreakResponse(obj: any): obj is TeachingBreakResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.startDate === 'string' &&
    typeof obj.endDate === 'string' &&
    typeof obj.breakType === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const AcademicCalendarValidationRules = {
  ACADEMIC_YEAR: {
    NAME: {
      MAX_LENGTH: 100,
      PATTERN: /^[\w\s-()]+$/,
      ERROR_MESSAGE: 'Year name can only contain alphanumeric characters, spaces, hyphens, and parentheses',
    },
    DATE_RANGE: {
      MIN_DURATION_DAYS: 180, // At least 6 months
      MAX_DURATION_DAYS: 730, // At most 2 years
      ERROR_MESSAGE: 'Academic year must be between 180 and 730 days',
    },
  },
  SEMESTER: {
    NAME: {
      MAX_LENGTH: 100,
      PATTERN: /^[\w\s-()]+$/,
      ERROR_MESSAGE: 'Semester name can only contain alphanumeric characters, spaces, hyphens, and parentheses',
    },
    NUMBER: {
      MIN: 1,
      MAX: 4,
      ERROR_MESSAGE: 'Semester number must be between 1 and 4',
    },
    DATE_RANGE: {
      MIN_DURATION_DAYS: 45,   // At least 45 days
      MAX_DURATION_DAYS: 180,  // At most 6 months
      ERROR_MESSAGE: 'Semester must be between 45 and 180 days',
    },
  },
  TEACHING_BREAK: {
    NAME: {
      MAX_LENGTH: 100,
      PATTERN: /^[\w\s-()]+$/,
      ERROR_MESSAGE: 'Break name can only contain alphanumeric characters, spaces, hyphens, and parentheses',
    },
    TYPES: ['vacation', 'holiday', 'staff-development', 'examination'],
    DATE_RANGE: {
      MIN_DURATION_DAYS: 1,
      MAX_DURATION_DAYS: 180,
      ERROR_MESSAGE: 'Teaching break must be between 1 and 180 days',
    },
  },
} as const;
