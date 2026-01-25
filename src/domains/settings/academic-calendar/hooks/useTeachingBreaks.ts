import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectTeachingBreaksByYearId,
  selectAcademicCalendarLoading,
  selectAcademicCalendarErrors,
  setTeachingBreaks,
  addTeachingBreak,
  updateTeachingBreak as updateTeachingBreakAction,
  removeTeachingBreak,
  setAcademicCalendarLoading,
  setAcademicCalendarError,
} from '../../settingsSlice';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import type { TeachingBreakFormData } from '../schemas/academicCalendarSchemas';

const BREAKS_CACHE_PREFIX = 'think-english-breaks:';

const cacheKeyForYear = (yearId: string) => `${BREAKS_CACHE_PREFIX}${yearId}`;

export function useTeachingBreaks(academicYearId: string | null | undefined) {
  const dispatch = useAppDispatch();
  const teachingBreaks = useAppSelector(selectTeachingBreaksByYearId(academicYearId || ''));
  const loading = useAppSelector(selectAcademicCalendarLoading);
  const errors = useAppSelector(selectAcademicCalendarErrors);

  const clearCache = useCallback((yearId?: string) => {
    if (yearId) {
      localStorage.removeItem(cacheKeyForYear(yearId));
      return;
    }
    // Remove all breaks caches by prefix scan
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BREAKS_CACHE_PREFIX)) {
        localStorage.removeItem(key);
        i--;
      }
    }
  }, []);

  const fetchTeachingBreaks = useCallback(async () => {
    if (!academicYearId) {
      dispatch(setTeachingBreaks({ yearId: '', breaks: [] }));
      return;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'fetchingBreaks', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'fetchBreaks', error: null }));

    try {
      const data = await academicCalendarApiService.getTeachingBreaksForYear(academicYearId);
      // Sort by start date
      const sorted = data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      dispatch(setTeachingBreaks({ yearId: academicYearId, breaks: sorted }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load teaching breaks';
      dispatch(setAcademicCalendarError({ operation: 'fetchBreaks', error: message }));
      toast.error(message);
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'fetchingBreaks', loading: false }));
    }
  }, [dispatch, academicYearId]);

  const createTeachingBreak = useCallback(async (data: TeachingBreakFormData): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'creatingBreak', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'createBreak', error: null }));

    try {
      const result = await academicCalendarApiService.createTeachingBreak(academicYearId, {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        breakType: data.breakType,
        notes: data.notes,
      });

      // Fetch the created break to get the full object
      const newBreak = await academicCalendarApiService.getTeachingBreak(result.id);
      dispatch(addTeachingBreak(newBreak));
      clearCache(academicYearId);
      toast.success('Teaching break created successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap with other breaks');
        dispatch(setAcademicCalendarError({ operation: 'createBreak', error: 'Validation error: Please check dates are within the academic year and do not overlap with other breaks' }));
      } else if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        toast.error('Academic year not found. Please select a valid academic year.');
        dispatch(setAcademicCalendarError({ operation: 'createBreak', error: 'Academic year not found' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create teaching break';
        dispatch(setAcademicCalendarError({ operation: 'createBreak', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'creatingBreak', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  const updateTeachingBreak = useCallback(async (id: string, data: TeachingBreakFormData): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'updatingBreak', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'updateBreak', error: null }));

    try {
      const updatedBreak = await academicCalendarApiService.updateTeachingBreak(id, {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        breakType: data.breakType,
        notes: data.notes,
      });
      dispatch(updateTeachingBreakAction(updatedBreak));
      clearCache(academicYearId);
      toast.success('Teaching break updated successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check dates are within the academic year and do not overlap with other breaks');
        dispatch(setAcademicCalendarError({ operation: 'updateBreak', error: 'Validation error: Please check dates are within the academic year and do not overlap with other breaks' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update teaching break';
        dispatch(setAcademicCalendarError({ operation: 'updateBreak', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'updatingBreak', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  const deleteTeachingBreak = useCallback(async (id: string): Promise<boolean> => {
    if (!academicYearId) {
      toast.error('Please select an academic year first');
      return false;
    }

    dispatch(setAcademicCalendarLoading({ operation: 'deletingBreak', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'deleteBreak', error: null }));

    try {
      await academicCalendarApiService.deleteTeachingBreak(id);
      dispatch(removeTeachingBreak({ yearId: academicYearId, breakId: id }));
      clearCache(academicYearId);
      toast.success('Teaching break deleted successfully');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete teaching break';
      dispatch(setAcademicCalendarError({ operation: 'deleteBreak', error: message }));
      toast.error(message);
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'deletingBreak', loading: false }));
    }
  }, [dispatch, academicYearId, clearCache]);

  return {
    teachingBreaks,
    academicYearId,
    loading: {
      fetching: loading.fetchingBreaks,
      creating: loading.creatingBreak,
      updating: loading.updatingBreak,
      deleting: loading.deletingBreak,
    },
    errors: {
      fetch: errors.fetchBreaks,
      create: errors.createBreak,
      update: errors.updateBreak,
      delete: errors.deleteBreak,
    },
    fetchTeachingBreaks,
    createTeachingBreak,
    updateTeachingBreak,
    deleteTeachingBreak,
  };
}
