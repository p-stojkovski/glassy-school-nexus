import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAcademicYears,
  selectActiveAcademicYearId,
  selectAcademicCalendarLoading,
  selectAcademicCalendarErrors,
  setAcademicYears,
  addAcademicYear,
  updateAcademicYear as updateAcademicYearAction,
  removeAcademicYear,
  setAcademicCalendarLoading,
  setAcademicCalendarError,
} from '../../settingsSlice';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';
import type { AcademicYear } from '../../types/academicCalendarTypes';
import type { AcademicYearFormData } from '../schemas/academicCalendarSchemas';

const CACHE_KEY = 'think-english-academic-years';

export function useAcademicYears() {
  const dispatch = useAppDispatch();
  const academicYears = useAppSelector(selectAcademicYears);
  const activeAcademicYearId = useAppSelector(selectActiveAcademicYearId);
  const loading = useAppSelector(selectAcademicCalendarLoading);
  const errors = useAppSelector(selectAcademicCalendarErrors);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    dispatch(setAcademicCalendarLoading({ operation: 'fetchingYears', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'fetchYears', error: null }));

    try {
      const data = await academicCalendarApiService.getAcademicYears();
      // Sort with active year first, then by start date descending
      const sorted = data.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
      dispatch(setAcademicYears(sorted));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load academic years';
      dispatch(setAcademicCalendarError({ operation: 'fetchYears', error: message }));
      toast.error(message);
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'fetchingYears', loading: false }));
    }
  }, [dispatch]);

  const createAcademicYear = useCallback(async (data: AcademicYearFormData): Promise<boolean> => {
    dispatch(setAcademicCalendarLoading({ operation: 'creatingYear', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'createYear', error: null }));

    try {
      const result = await academicCalendarApiService.createAcademicYear({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      });

      // Fetch the created year to get the full object
      const newYear = await academicCalendarApiService.getAcademicYear(result.id);
      dispatch(addAcademicYear(newYear));
      clearCache();
      toast.success('Academic year created successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Academic year with this name already exists or overlaps with another year');
        dispatch(setAcademicCalendarError({ operation: 'createYear', error: 'Academic year with this name already exists or overlaps with another year' }));
      } else if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check your dates and try again');
        dispatch(setAcademicCalendarError({ operation: 'createYear', error: 'Validation error: Please check your dates and try again' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create academic year';
        dispatch(setAcademicCalendarError({ operation: 'createYear', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'creatingYear', loading: false }));
    }
  }, [dispatch, clearCache]);

  const updateAcademicYear = useCallback(async (id: string, data: AcademicYearFormData): Promise<boolean> => {
    dispatch(setAcademicCalendarLoading({ operation: 'updatingYear', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'updateYear', error: null }));

    try {
      const updatedYear = await academicCalendarApiService.updateAcademicYear(id, {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      });
      dispatch(updateAcademicYearAction(updatedYear));
      clearCache();
      toast.success('Academic year updated successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Academic year with this name already exists or overlaps with another year');
        dispatch(setAcademicCalendarError({ operation: 'updateYear', error: 'Academic year with this name already exists or overlaps with another year' }));
      } else if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
        toast.error('Validation error: Please check your dates and try again');
        dispatch(setAcademicCalendarError({ operation: 'updateYear', error: 'Validation error: Please check your dates and try again' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update academic year';
        dispatch(setAcademicCalendarError({ operation: 'updateYear', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'updatingYear', loading: false }));
    }
  }, [dispatch, clearCache]);

  const deleteAcademicYear = useCallback(async (id: string): Promise<boolean> => {
    dispatch(setAcademicCalendarLoading({ operation: 'deletingYear', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'deleteYear', error: null }));

    try {
      await academicCalendarApiService.deleteAcademicYear(id);
      dispatch(removeAcademicYear(id));
      clearCache();
      toast.success('Academic year deleted successfully');
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Cannot delete academic year: it has associated semesters, breaks, or holidays');
        dispatch(setAcademicCalendarError({ operation: 'deleteYear', error: 'Cannot delete academic year: it has associated semesters, breaks, or holidays' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to delete academic year';
        dispatch(setAcademicCalendarError({ operation: 'deleteYear', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'deletingYear', loading: false }));
    }
  }, [dispatch, clearCache]);

  const activateAcademicYear = useCallback(async (year: AcademicYear): Promise<boolean> => {
    if (year.isActive) return true; // Already active

    dispatch(setAcademicCalendarLoading({ operation: 'updatingYear', loading: true }));
    dispatch(setAcademicCalendarError({ operation: 'updateYear', error: null }));

    try {
      const activatedYear = await academicCalendarApiService.activateAcademicYear(year.id);
      dispatch(updateAcademicYearAction(activatedYear));
      clearCache();
      toast.success(`${year.name} has been set as the active academic year`);
      // Re-fetch to ensure all years have correct isActive state
      await fetchAcademicYears();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to activate academic year';
      dispatch(setAcademicCalendarError({ operation: 'updateYear', error: message }));
      toast.error(message);
      return false;
    } finally {
      dispatch(setAcademicCalendarLoading({ operation: 'updatingYear', loading: false }));
    }
  }, [dispatch, clearCache, fetchAcademicYears]);

  return {
    academicYears,
    activeAcademicYearId,
    loading: {
      fetching: loading.fetchingYears,
      creating: loading.creatingYear,
      updating: loading.updatingYear,
      deleting: loading.deletingYear,
    },
    errors: {
      fetch: errors.fetchYears,
      create: errors.createYear,
      update: errors.updateYear,
      delete: errors.deleteYear,
    },
    fetchAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    activateAcademicYear,
  };
}
