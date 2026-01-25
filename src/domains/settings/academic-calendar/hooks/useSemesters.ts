import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSemestersByYearId,
  selectAcademicCalendarLoading,
  selectAcademicCalendarErrors,
  setSemesters,
  addSemester,
  updateSemester as updateSemesterAction,
  removeSemester,
  setAcademicCalendarLoading,
  setAcademicCalendarError,
} from '../../settingsSlice';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import type { SemesterFormData } from '../schemas/academicCalendarSchemas';

const SEMESTERS_CACHE_PREFIX = 'think-english-semesters:';

const cacheKeyForYear = (yearId: string) => `${SEMESTERS_CACHE_PREFIX}${yearId}`;

export function useSemesters(academicYearId: string | null | undefined) {
  const dispatch = useAppDispatch();
  const semesters = useAppSelector(selectSemestersByYearId(academicYearId || ''));
  const loading = useAppSelector(selectAcademicCalendarLoading);
  const errors = useAppSelector(selectAcademicCalendarErrors);

  const clearCache = useCallback((yearId?: string) => {
    if (yearId) {
      localStorage.removeItem(cacheKeyForYear(yearId));
      return;
    }
    // Remove all semester caches by prefix scan
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SEMESTERS_CACHE_PREFIX)) {
        localStorage.removeItem(key);
        i--;
      }
    }
  }, []);

  const fetchSemesters = useCallback(async () => {
    if (!academicYearId) {
      dispatch(setSemesters({ yearId: '', semesters: [] }));
      return;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'fetchingSemesters', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'fetchSemesters', error: null }));

    try {
      const data = await academicCalendarApiService.getSemestersForYear(academicYearId);
      // Sort by semester number
      const sorted = data.sort((a, b) => a.semesterNumber - b.semesterNumber);
      dispatch(setSemesters({ yearId: academicYearId, semesters: sorted }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load semesters';
      dispatch(setAcademicCalendarError({ operation: 'fetchSemesters', error: message }));
      toast.error(message);
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'fetchingSemesters', loading: false }));
    }
  }, [dispatch, academicYearId]);

  const createSemester = useCallback(async (data: SemesterFormData): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'creatingSemester', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'createSemester', error: null }));

    try {
      const result = await academicCalendarApiService.createSemester(academicYearId, {
        name: data.name,
        semesterNumber: data.semesterNumber,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      // Fetch the created semester to get the full object
      const newSemester = await academicCalendarApiService.getSemester(result.id);
      dispatch(addSemester(newSemester));
      clearCache(academicYearId);
      toast.success('Semester created successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap');
        dispatch(setAcademicCalendarError({ operation: 'createSemester', error: 'Validation error: Please check dates are within the academic year and do not overlap' }));
      } else if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        toast.error('Academic year not found. Please select a valid academic year.');
        dispatch(setAcademicCalendarError({ operation: 'createSemester', error: 'Academic year not found' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create semester';
        dispatch(setAcademicCalendarError({ operation: 'createSemester', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'creatingSemester', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  const updateSemester = useCallback(async (id: string, data: SemesterFormData): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'updatingSemester', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'updateSemester', error: null }));

    try {
      const updatedSemester = await academicCalendarApiService.updateSemester(academicYearId, id, {
        name: data.name,
        semesterNumber: data.semesterNumber,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      dispatch(updateSemesterAction(updatedSemester));
      clearCache(academicYearId);
      toast.success('Semester updated successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap');
        dispatch(setAcademicCalendarError({ operation: 'updateSemester', error: 'Validation error: Please check dates are within the academic year and do not overlap' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update semester';
        dispatch(setAcademicCalendarError({ operation: 'updateSemester', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'updatingSemester', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  const deleteSemester = useCallback(async (id: string): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'deletingSemester', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'deleteSemester', error: null }));

    try {
      await academicCalendarApiService.deleteSemester(academicYearId, id);
      dispatch(removeSemester({ yearId: academicYearId, semesterId: id }));
      clearCache(academicYearId);
      toast.success('Semester deleted successfully');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete semester';
      dispatch(setAcademicCalendarError({ operation: 'deleteSemester', error: message }));
      toast.error(message);
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'deletingSemester', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  return {
    semesters,
    academicYearId,
    loading: {
      fetching: loading.fetchingSemesters,
      creating: loading.creatingSemester,
      updating: loading.updatingSemester,
      deleting: loading.deletingSemester,
    },
    errors: {
      fetch: errors.fetchSemesters,
      create: errors.createSemester,
      update: errors.updateSemester,
      delete: errors.deleteSemester,
    },
    fetchSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
  };
}
