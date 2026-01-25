import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectLessonStatuses,
  selectLessonStatusesLoading,
  selectLessonStatusesErrors,
  setLessonStatuses,
  updateLessonStatus,
  setLessonStatusesLoading,
  setLessonStatusesError,
} from '../../settingsSlice';
import lessonStatusApiService from '@/services/lessonStatusApiService';
import type { LessonStatus, UpdateLessonStatusRequest } from '../../types/lessonStatusTypes';
import { toast } from 'sonner';

export function useLessonStatuses() {
  const dispatch = useAppDispatch();
  const lessonStatuses = useAppSelector(selectLessonStatuses);
  const loading = useAppSelector(selectLessonStatusesLoading);
  const errors = useAppSelector(selectLessonStatusesErrors);

  const fetchLessonStatuses = useCallback(async () => {
    dispatch(setLessonStatusesLoading({ operation: 'fetching', loading: true }));
    dispatch(setLessonStatusesError({ operation: 'fetch', error: null }));

    try {
      const data = await lessonStatusApiService.getAll();
      dispatch(setLessonStatuses(data));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load lesson statuses';
      dispatch(setLessonStatusesError({ operation: 'fetch', error: message }));
      toast.error(message);
    } finally {
      dispatch(setLessonStatusesLoading({ operation: 'fetching', loading: false }));
    }
  }, [dispatch]);

  const updateLessonStatusById = useCallback(async (
    id: string, 
    data: UpdateLessonStatusRequest
  ): Promise<LessonStatus | null> => {
    dispatch(setLessonStatusesLoading({ operation: 'updating', loading: true }));
    dispatch(setLessonStatusesError({ operation: 'update', error: null }));

    try {
      const updated = await lessonStatusApiService.update(id, data);
      dispatch(updateLessonStatus(updated));
      toast.success('Lesson status updated successfully');
      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update lesson status';
      dispatch(setLessonStatusesError({ operation: 'update', error: message }));
      toast.error(message);
      return null;
    } finally {
      dispatch(setLessonStatusesLoading({ operation: 'updating', loading: false }));
    }
  }, [dispatch]);

  return {
    lessonStatuses,
    loading,
    errors,
    fetchLessonStatuses,
    updateLessonStatus: updateLessonStatusById,
    // Note: No create or delete - lesson statuses are predefined
  };
}
