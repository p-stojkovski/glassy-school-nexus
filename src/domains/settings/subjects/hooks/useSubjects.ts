import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSubjects,
  selectSubjectsLoading,
  selectSubjectsErrors,
  setSubjects,
  addSubject,
  updateSubject as updateSubjectAction,
  removeSubject,
  setSubjectsLoading,
  setSubjectsError,
} from '../../settingsSlice';
import subjectApiService from '@/services/subjectApiService';
import type { CreateSubjectRequest, UpdateSubjectRequest } from '@/domains/settings/types/subjectTypes';
import type { SubjectFormData } from '../schemas/subjectSchemas';

const CACHE_KEY = 'think-english-subjects';

export function useSubjects() {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector(selectSubjects);
  const loading = useAppSelector(selectSubjectsLoading);
  const errors = useAppSelector(selectSubjectsErrors);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const fetchSubjects = useCallback(async () => {
    dispatch(setSubjectsLoading({ operation: 'fetching', loading: true }));
    dispatch(setSubjectsError({ operation: 'fetch', error: null }));

    try {
      const data = await subjectApiService.getAll();
      const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
      dispatch(setSubjects(sorted));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load subjects';
      dispatch(setSubjectsError({ operation: 'fetch', error: message }));
      toast.error(message);
    } finally {
      dispatch(setSubjectsLoading({ operation: 'fetching', loading: false }));
    }
  }, [dispatch]);

  const createSubject = useCallback(async (data: SubjectFormData): Promise<boolean> => {
    dispatch(setSubjectsLoading({ operation: 'creating', loading: true }));
    dispatch(setSubjectsError({ operation: 'create', error: null }));

    try {
      const request: CreateSubjectRequest = {
        key: data.key,
        name: data.name,
        sortOrder: data.sortOrder,
      };
      const newSubject = await subjectApiService.create(request);
      dispatch(addSubject(newSubject));
      clearCache();
      toast.success('Subject created successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Subject with this key already exists');
        dispatch(setSubjectsError({ operation: 'create', error: 'Subject with this key already exists' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create subject';
        dispatch(setSubjectsError({ operation: 'create', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setSubjectsLoading({ operation: 'creating', loading: false }));
    }
  }, [dispatch, clearCache]);

  const updateSubject = useCallback(async (id: number, data: SubjectFormData): Promise<boolean> => {
    dispatch(setSubjectsLoading({ operation: 'updating', loading: true }));
    dispatch(setSubjectsError({ operation: 'update', error: null }));

    try {
      const request: UpdateSubjectRequest = {
        key: data.key,
        name: data.name,
        sortOrder: data.sortOrder,
      };
      const updatedSubject = await subjectApiService.update(id, request);
      dispatch(updateSubjectAction(updatedSubject));
      clearCache();
      toast.success('Subject updated successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Subject with this key already exists');
        dispatch(setSubjectsError({ operation: 'update', error: 'Subject with this key already exists' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update subject';
        dispatch(setSubjectsError({ operation: 'update', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setSubjectsLoading({ operation: 'updating', loading: false }));
    }
  }, [dispatch, clearCache]);

  const deleteSubject = useCallback(async (id: number): Promise<boolean> => {
    dispatch(setSubjectsLoading({ operation: 'deleting', loading: true }));
    dispatch(setSubjectsError({ operation: 'delete', error: null }));

    try {
      await subjectApiService.delete(id);
      dispatch(removeSubject(id));
      clearCache();
      toast.success('Subject deleted successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially (subject in use)
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Cannot delete subject: it is currently in use');
        dispatch(setSubjectsError({ operation: 'delete', error: 'Cannot delete subject: it is currently in use' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to delete subject';
        dispatch(setSubjectsError({ operation: 'delete', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setSubjectsLoading({ operation: 'deleting', loading: false }));
    }
  }, [dispatch, clearCache]);

  return {
    subjects,
    loading,
    errors,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
