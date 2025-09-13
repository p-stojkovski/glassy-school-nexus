import apiService from '@/services/api';
import {
  AcademicYear,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  Semester,
  CreateSemesterRequest,
  UpdateSemesterRequest,
  SuggestSemestersRequest,
  SuggestedSemester,
  TeachingBreak,
  CreateTeachingBreakRequest,
  UpdateTeachingBreakRequest,
  PublicHoliday,
  CreatePublicHolidayRequest,
  UpdatePublicHolidayRequest,
  NonTeachingDatesResponse,
  TeachingDaysCountResponse,
  SemesterSummaryResponse,
} from '../types/academicCalendarTypes';

// Internal helper to normalize IDs coming from API where value objects may serialize as objects
function normalizeId(id: any): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object') {
    if (typeof (id as any).value === 'string') return (id as any).value;
    if (typeof (id as any).id === 'string') return (id as any).id;
    if ((id as any).value && typeof (id as any).value === 'object' && typeof (id as any).value.toString === 'function') {
      return (id as any).value.toString();
    }
  }
  return String(id);
}

export class AcademicCalendarApiService {
  private readonly baseEndpoint = '/api/academic-calendar';

  // Academic Years endpoints
  async getAllAcademicYears(): Promise<AcademicYear[]> {
const result = await apiService.get<any[]>(`${this.baseEndpoint}/years`);
    // Normalize potential value-object IDs to plain strings
    return result.map((y) => ({
      ...y,
      id: normalizeId(y.id),
    })) as AcademicYear[];
  }

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const safeId = normalizeId(id);
const y = await apiService.get<any>(`${this.baseEndpoint}/years/${safeId}`);
    return { ...y, id: normalizeId(y.id) } as AcademicYear;
  }

  async getActiveAcademicYear(): Promise<AcademicYear> {
const y = await apiService.get<any>(`${this.baseEndpoint}/years/active`);
    return { ...y, id: normalizeId(y.id) } as AcademicYear;
  }

  async createAcademicYear(data: CreateAcademicYearRequest): Promise<{ id: string }> {
return apiService.post<{ id: string }>(`${this.baseEndpoint}/years`, data);
  }

  async updateAcademicYear(id: string, data: UpdateAcademicYearRequest): Promise<AcademicYear> {
return apiService.put<AcademicYear>(`${this.baseEndpoint}/years/${id}`, data);
  }

  async deleteAcademicYear(id: string): Promise<void> {
return apiService.delete<void>(`${this.baseEndpoint}/years/${id}`);
  }

  async activateAcademicYear(id: string): Promise<AcademicYear> {
return apiService.post<AcademicYear>(`${this.baseEndpoint}/years/${id}/activate`, {});
  }

  // Semesters endpoints
  async getSemestersByYear(yearId: string): Promise<Semester[]> {
    const safeYearId = normalizeId(yearId);
    if (!safeYearId || typeof safeYearId !== 'string') {
      throw new Error('Invalid yearId: must be a non-empty string');
    }
return apiService.get<Semester[]>(`${this.baseEndpoint}/years/${safeYearId}/semesters`);
  }

  async getSemesterById(id: string): Promise<Semester> {
return apiService.get<Semester>(`${this.baseEndpoint}/semesters/${id}`);
  }

  async createSemester(yearId: string, data: CreateSemesterRequest): Promise<{ id: string }> {
    const safeYearId = normalizeId(yearId);
    if (!safeYearId || typeof safeYearId !== 'string') {
      throw new Error('Invalid yearId: must be a non-empty string');
    }
return apiService.post<{ id: string }>(`${this.baseEndpoint}/years/${safeYearId}/semesters`, data);
  }

  async updateSemester(id: string, data: UpdateSemesterRequest): Promise<Semester> {
return apiService.put<Semester>(`${this.baseEndpoint}/semesters/${id}`, data);
  }

  async deleteSemester(id: string): Promise<void> {
return apiService.delete<void>(`${this.baseEndpoint}/semesters/${id}`);
  }

  // Teaching Breaks endpoints
  async getTeachingBreaksByYear(yearId: string): Promise<TeachingBreak[]> {
    const safeYearId = normalizeId(yearId);
    if (!safeYearId || typeof safeYearId !== 'string') {
      throw new Error('Invalid yearId: must be a non-empty string');
    }
return apiService.get<TeachingBreak[]>(`${this.baseEndpoint}/years/${safeYearId}/breaks`);
  }

  async getTeachingBreakById(id: string): Promise<TeachingBreak> {
return apiService.get<TeachingBreak>(`${this.baseEndpoint}/breaks/${id}`);
  }

  async createTeachingBreak(yearId: string, data: CreateTeachingBreakRequest): Promise<{ id: string }> {
return apiService.post<{ id: string }>(`${this.baseEndpoint}/years/${yearId}/breaks`, data);
  }

  async updateTeachingBreak(id: string, data: UpdateTeachingBreakRequest): Promise<TeachingBreak> {
return apiService.put<TeachingBreak>(`${this.baseEndpoint}/breaks/${id}`, data);
  }

  async deleteTeachingBreak(id: string): Promise<void> {
return apiService.delete<void>(`${this.baseEndpoint}/breaks/${id}`);
  }

  // Public Holidays endpoints
  async getPublicHolidaysByYear(yearId: string): Promise<PublicHoliday[]> {
    const safeYearId = normalizeId(yearId);
    if (!safeYearId || typeof safeYearId !== 'string') {
      throw new Error('Invalid yearId: must be a non-empty string');
    }
return apiService.get<PublicHoliday[]>(`${this.baseEndpoint}/years/${safeYearId}/public-holidays`);
  }

  async getPublicHolidayById(id: string): Promise<PublicHoliday> {
return apiService.get<PublicHoliday>(`${this.baseEndpoint}/public-holidays/${id}`);
  }

  async createPublicHoliday(yearId: string, data: CreatePublicHolidayRequest): Promise<{ id: string }> {
return apiService.post<{ id: string }>(`${this.baseEndpoint}/years/${yearId}/public-holidays`, data);
  }

  async updatePublicHoliday(id: string, data: UpdatePublicHolidayRequest): Promise<PublicHoliday> {
return apiService.put<PublicHoliday>(`${this.baseEndpoint}/public-holidays/${id}`, data);
  }

  async deletePublicHoliday(id: string): Promise<void> {
return apiService.delete<void>(`${this.baseEndpoint}/public-holidays/${id}`);
  }

  // Utility endpoints
  async getNonTeachingDates(
    yearId: string,
    from: string,
    to: string
  ): Promise<NonTeachingDatesResponse> {
    const params = new URLSearchParams({ from, to });
return apiService.get<NonTeachingDatesResponse>(
      `${this.baseEndpoint}/years/${yearId}/non-teaching-dates?${params.toString()}`
    );
  }

  async getTeachingDaysCount(
    yearId: string,
    from: string,
    to: string
  ): Promise<TeachingDaysCountResponse> {
    const params = new URLSearchParams({ from, to });
return apiService.get<TeachingDaysCountResponse>(
      `${this.baseEndpoint}/years/${yearId}/teaching-days-count?${params.toString()}`
    );
  }

  async getSemesterSummary(id: string): Promise<SemesterSummaryResponse> {
return apiService.get<SemesterSummaryResponse>(`${this.baseEndpoint}/semesters/${id}/summary`);
  }
}

export default new AcademicCalendarApiService();
