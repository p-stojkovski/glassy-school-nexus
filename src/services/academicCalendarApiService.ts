/**
 * Academic Calendar API Service
 * Manages academic years, semesters, teaching breaks, and calendar utilities
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  ActivateAcademicYearRequest,
  AcademicYearResponse,
  CreateYearResponse,
  CreateAcademicSemesterRequest,
  UpdateAcademicSemesterRequest,
  AcademicSemesterResponse,
  CreateSemesterResponse,
  CreateTeachingBreakRequest,
  UpdateTeachingBreakRequest,
  TeachingBreakResponse,
  CreateTeachingBreakResponse,
  GetNonTeachingDatesResponse,
  GetTeachingDaysCountResponse,
  GetSemesterSummaryResponse,
  GetAcademicYearsParams,
  GetSemestersParams,
  GetNonTeachingDatesParams,
  GetTeachingDaysCountParams,
  AcademicCalendarApiPaths,
  AcademicCalendarHttpStatus,
} from '@/types/api/academic-calendar';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

// Normalize API responses that may wrap arrays in different shapes
function normalizeListResponse<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const candidates = [
      (raw as any).items,
      (raw as any).results,
      (raw as any).years,
      (raw as any).semesters,
      (raw as any).breaks,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

export class AcademicCalendarApiService {
  // ========================================================================
  // ACADEMIC YEARS
  // ========================================================================

  /**
   * Create a new academic year
   */
  async createAcademicYear(request: CreateAcademicYearRequest): Promise<CreateYearResponse> {
    try {
      return await apiService.post<CreateYearResponse>(
        AcademicCalendarApiPaths.YEARS_BASE,
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        const detail = error.details?.detail || '';
        if (detail.includes('name')) {
          throw makeApiError(error, 'An academic year with this name already exists');
        }
        if (detail.includes('overlap')) {
          throw makeApiError(error, 'Academic year dates overlap with an existing year');
        }
        throw makeApiError(error, 'Academic year conflicts with existing data');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid academic year data provided');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create academic years');
      }
      throw makeApiError(error, `Failed to create academic year: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all academic years
   */
  async getAcademicYears(params: GetAcademicYearsParams = {}): Promise<AcademicYearResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.isActiveOnly !== undefined) qs.append('isActiveOnly', String(params.isActiveOnly));
      if (params.sortBy) qs.append('sortBy', params.sortBy);
      if (params.sortOrder) qs.append('sortOrder', params.sortOrder);

      const endpoint = qs.toString()
        ? `${AcademicCalendarApiPaths.YEARS_BASE}?${qs.toString()}`
        : AcademicCalendarApiPaths.YEARS_BASE;

      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<AcademicYearResponse>(raw);
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access academic years');
      }
      throw makeApiError(error, `Failed to fetch academic years: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific academic year by ID
   */
  async getAcademicYear(id: string): Promise<AcademicYearResponse> {
    try {
      return await apiService.get<AcademicYearResponse>(
        AcademicCalendarApiPaths.YEARS_BY_ID(id)
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access academic year');
      }
      throw makeApiError(error, `Failed to fetch academic year: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing academic year
   */
  async updateAcademicYear(id: string, request: UpdateAcademicYearRequest): Promise<AcademicYearResponse> {
    try {
      return await apiService.put<AcademicYearResponse>(
        AcademicCalendarApiPaths.YEARS_BY_ID(id),
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Academic year dates overlap with another year');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid academic year data provided');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update academic years');
      }
      throw makeApiError(error, `Failed to update academic year: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete an academic year
   */
  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await apiService.delete<void>(AcademicCalendarApiPaths.YEARS_BY_ID(id));
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Cannot delete academic year - it has dependent semesters or breaks');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete academic years');
      }
      throw makeApiError(error, `Failed to delete academic year: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Activate an academic year
   */
  async activateAcademicYear(id: string): Promise<AcademicYearResponse> {
    try {
      return await apiService.post<AcademicYearResponse>(
        AcademicCalendarApiPaths.YEARS_ACTIVATE(id),
        {}
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Cannot activate year - dates overlap with currently active year');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to activate academic years');
      }
      throw makeApiError(error, `Failed to activate academic year: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get the currently active academic year
   */
  async getActiveAcademicYear(): Promise<AcademicYearResponse> {
    try {
      return await apiService.get<AcademicYearResponse>(
        AcademicCalendarApiPaths.YEARS_ACTIVE
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'No active academic year found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access active academic year');
      }
      throw makeApiError(error, `Failed to fetch active academic year: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // SEMESTERS
  // ========================================================================

  /**
   * Create a new semester for a specific academic year
   */
  async createSemester(
    yearId: string,
    request: CreateAcademicSemesterRequest
  ): Promise<CreateSemesterResponse> {
    try {
      return await apiService.post<CreateSemesterResponse>(
        AcademicCalendarApiPaths.SEMESTERS_FOR_YEAR(yearId),
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Semester number already exists for this year or dates overlap');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid semester data - dates must be within academic year');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create semesters');
      }
      throw makeApiError(error, `Failed to create semester: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all semesters
   */
  async getAllSemesters(params: GetSemestersParams = {}): Promise<AcademicSemesterResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.isActiveOnly !== undefined) qs.append('isActiveOnly', String(params.isActiveOnly));
      if (params.sortBy) qs.append('sortBy', params.sortBy);
      if (params.sortOrder) qs.append('sortOrder', params.sortOrder);

      const endpoint = qs.toString()
        ? `${AcademicCalendarApiPaths.SEMESTERS_BASE}?${qs.toString()}`
        : AcademicCalendarApiPaths.SEMESTERS_BASE;

      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<AcademicSemesterResponse>(raw);
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access semesters');
      }
      throw makeApiError(error, `Failed to fetch semesters: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get semesters for a specific academic year
   */
  async getSemestersForYear(
    yearId: string,
    params: GetSemestersParams = {}
  ): Promise<AcademicSemesterResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.isActiveOnly !== undefined) qs.append('isActiveOnly', String(params.isActiveOnly));
      if (params.sortBy) qs.append('sortBy', params.sortBy);
      if (params.sortOrder) qs.append('sortOrder', params.sortOrder);

      const endpoint = qs.toString()
        ? `${AcademicCalendarApiPaths.SEMESTERS_FOR_YEAR(yearId)}?${qs.toString()}`
        : AcademicCalendarApiPaths.SEMESTERS_FOR_YEAR(yearId);

      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<AcademicSemesterResponse>(raw);
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access semesters');
      }
      throw makeApiError(error, `Failed to fetch semesters: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific semester by ID
   */
  async getSemester(id: string): Promise<AcademicSemesterResponse> {
    try {
      return await apiService.get<AcademicSemesterResponse>(
        AcademicCalendarApiPaths.SEMESTERS_BY_ID(id)
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Semester not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access semester');
      }
      throw makeApiError(error, `Failed to fetch semester: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a semester
   */
  async updateSemester(
    yearId: string,
    id: string,
    request: UpdateAcademicSemesterRequest
  ): Promise<AcademicSemesterResponse> {
    try {
      return await apiService.put<AcademicSemesterResponse>(
        AcademicCalendarApiPaths.SEMESTERS_FOR_YEAR_BY_ID(yearId, id),
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Semester or academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Semester dates conflict with existing semesters');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid semester data - dates must be within academic year');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update semesters');
      }
      throw makeApiError(error, `Failed to update semester: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a semester
   */
  async deleteSemester(yearId: string, id: string): Promise<void> {
    try {
      await apiService.delete<void>(
        AcademicCalendarApiPaths.SEMESTERS_FOR_YEAR_BY_ID(yearId, id)
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Semester not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Cannot delete semester - it has dependent data');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete semesters');
      }
      throw makeApiError(error, `Failed to delete semester: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // TEACHING BREAKS
  // ========================================================================

  /**
   * Create a new teaching break for a specific academic year
   */
  async createTeachingBreak(
    yearId: string,
    request: CreateTeachingBreakRequest
  ): Promise<CreateTeachingBreakResponse> {
    try {
      return await apiService.post<CreateTeachingBreakResponse>(
        AcademicCalendarApiPaths.TEACHING_BREAKS_FOR_YEAR(yearId),
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Teaching break name already exists for this year or dates overlap');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid teaching break data');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create teaching breaks');
      }
      throw makeApiError(error, `Failed to create teaching break: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teaching breaks for a specific academic year
   */
  async getTeachingBreaksForYear(yearId: string): Promise<TeachingBreakResponse[]> {
    try {
      const raw = await apiService.get<any>(
        AcademicCalendarApiPaths.TEACHING_BREAKS_FOR_YEAR(yearId)
      );
      return normalizeListResponse<TeachingBreakResponse>(raw);
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teaching breaks');
      }
      throw makeApiError(error, `Failed to fetch teaching breaks: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific teaching break by ID
   */
  async getTeachingBreak(id: string): Promise<TeachingBreakResponse> {
    try {
      return await apiService.get<TeachingBreakResponse>(
        AcademicCalendarApiPaths.TEACHING_BREAKS_BY_ID(id)
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teaching break not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teaching break');
      }
      throw makeApiError(error, `Failed to fetch teaching break: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a teaching break
   */
  async updateTeachingBreak(
    id: string,
    request: UpdateTeachingBreakRequest
  ): Promise<TeachingBreakResponse> {
    try {
      return await apiService.put<TeachingBreakResponse>(
        AcademicCalendarApiPaths.TEACHING_BREAKS_BY_ID(id),
        request
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teaching break not found');
      }
      if (error.status === AcademicCalendarHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Teaching break dates overlap with existing breaks');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid teaching break data');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update teaching breaks');
      }
      throw makeApiError(error, `Failed to update teaching break: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a teaching break
   */
  async deleteTeachingBreak(id: string): Promise<void> {
    try {
      await apiService.delete<void>(AcademicCalendarApiPaths.TEACHING_BREAKS_BY_ID(id));
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teaching break not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete teaching breaks');
      }
      throw makeApiError(error, `Failed to delete teaching break: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // UTILITY ENDPOINTS
  // ========================================================================

  /**
   * Get non-teaching dates (holidays and breaks) in a date range
   */
  async getNonTeachingDates(
    yearId: string,
    params: GetNonTeachingDatesParams
  ): Promise<GetNonTeachingDatesResponse> {
    try {
      const qs = new URLSearchParams();
      qs.append('fromDate', params.fromDate);
      qs.append('toDate', params.toDate);

      return await apiService.get<GetNonTeachingDatesResponse>(
        `${AcademicCalendarApiPaths.NON_TEACHING_DATES(yearId)}?${qs.toString()}`
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid date range provided');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access calendar data');
      }
      throw makeApiError(error, `Failed to fetch non-teaching dates: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get count of teaching days in a date range
   */
  async getTeachingDaysCount(
    yearId: string,
    params: GetTeachingDaysCountParams
  ): Promise<GetTeachingDaysCountResponse> {
    try {
      const qs = new URLSearchParams();
      qs.append('fromDate', params.fromDate);
      qs.append('toDate', params.toDate);

      return await apiService.get<GetTeachingDaysCountResponse>(
        `${AcademicCalendarApiPaths.TEACHING_DAYS_COUNT(yearId)}?${qs.toString()}`
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Academic year not found');
      }
      if (error.status === AcademicCalendarHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid date range provided');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access calendar data');
      }
      throw makeApiError(error, `Failed to fetch teaching days count: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get semester summary with teaching days and breaks
   */
  async getSemesterSummary(semesterId: string): Promise<GetSemesterSummaryResponse> {
    try {
      return await apiService.get<GetSemesterSummaryResponse>(
        AcademicCalendarApiPaths.SEMESTER_SUMMARY(semesterId)
      );
    } catch (error: any) {
      if (error.status === AcademicCalendarHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Semester not found');
      }
      if (error.status === AcademicCalendarHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access semester data');
      }
      throw makeApiError(error, `Failed to fetch semester summary: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const academicCalendarApiService = new AcademicCalendarApiService();

// Convenience exports matching project style
export const createAcademicYear = (request: CreateAcademicYearRequest) =>
  academicCalendarApiService.createAcademicYear(request);

export const getAcademicYears = (params?: GetAcademicYearsParams) =>
  academicCalendarApiService.getAcademicYears(params);

export const getAcademicYear = (id: string) =>
  academicCalendarApiService.getAcademicYear(id);

export const updateAcademicYear = (id: string, request: UpdateAcademicYearRequest) =>
  academicCalendarApiService.updateAcademicYear(id, request);

export const deleteAcademicYear = (id: string) =>
  academicCalendarApiService.deleteAcademicYear(id);

export const activateAcademicYear = (id: string) =>
  academicCalendarApiService.activateAcademicYear(id);

export const getActiveAcademicYear = () =>
  academicCalendarApiService.getActiveAcademicYear();

export const createSemester = (yearId: string, request: CreateAcademicSemesterRequest) =>
  academicCalendarApiService.createSemester(yearId, request);

export const getAllSemesters = (params?: GetSemestersParams) =>
  academicCalendarApiService.getAllSemesters(params);

export const getSemestersForYear = (yearId: string, params?: GetSemestersParams) =>
  academicCalendarApiService.getSemestersForYear(yearId, params);

export const getSemester = (id: string) =>
  academicCalendarApiService.getSemester(id);

export const updateSemester = (yearId: string, id: string, request: UpdateAcademicSemesterRequest) =>
  academicCalendarApiService.updateSemester(yearId, id, request);

export const deleteSemester = (yearId: string, id: string) =>
  academicCalendarApiService.deleteSemester(yearId, id);

export const createTeachingBreak = (yearId: string, request: CreateTeachingBreakRequest) =>
  academicCalendarApiService.createTeachingBreak(yearId, request);

export const getTeachingBreaksForYear = (yearId: string) =>
  academicCalendarApiService.getTeachingBreaksForYear(yearId);

export const getTeachingBreak = (id: string) =>
  academicCalendarApiService.getTeachingBreak(id);

export const updateTeachingBreak = (id: string, request: UpdateTeachingBreakRequest) =>
  academicCalendarApiService.updateTeachingBreak(id, request);

export const deleteTeachingBreak = (id: string) =>
  academicCalendarApiService.deleteTeachingBreak(id);

export const getNonTeachingDates = (yearId: string, params: GetNonTeachingDatesParams) =>
  academicCalendarApiService.getNonTeachingDates(yearId, params);

export const getTeachingDaysCount = (yearId: string, params: GetTeachingDaysCountParams) =>
  academicCalendarApiService.getTeachingDaysCount(yearId, params);

export const getSemesterSummary = (semesterId: string) =>
  academicCalendarApiService.getSemesterSummary(semesterId);

// Export default
export default academicCalendarApiService;
