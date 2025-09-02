import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  setClasses,
  addClass,
  updateClass as updateInStore,
  deleteClass as deleteFromStore,
  setSelectedClass,
  setLoadingState,
  setError,
  clearError,
  clearAllErrors,
  setSearchResults,
  setSearchQuery,
  setSearchParams,
  setSearchMode,
} from '@/domains/classesApi/classesApiSlice';
import { classApiService, getAllClasses, searchClasses, createClass, updateClass, deleteClass } from '@/services/classApiService';
import { ClassResponse, ClassSearchParams, CreateClassRequest, UpdateClassRequest } from '@/types/api/class';
import { showSuccessMessage, ClassErrorHandlers } from '@/utils/apiErrorHandler';
import { validateAndPrepareClassData, ClassFormData } from '@/utils/validation/classValidators';
import { useCallback } from 'react';

export const useClassesApi = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s: RootState) => s.classesApi);

  const loadClasses = useCallback(async () => {
    dispatch(clearError('fetch'));
    try {
      const data = await getAllClasses();
      dispatch(setClasses(data));
    } catch (error) {
      const msg = ClassErrorHandlers.fetchAll(error);
      dispatch(setError({ operation: 'fetch', error: msg }));
    }
  }, [dispatch]);

  const search = useCallback(async (params: ClassSearchParams) => {
    dispatch(clearError('search'));
    dispatch(setSearchParams(params));
    try {
      const results = await searchClasses(params);
      dispatch(setSearchResults(results));
      dispatch(setSearchMode(true));
    } catch (error) {
      const msg = ClassErrorHandlers.search(error);
      dispatch(setError({ operation: 'search', error: msg }));
    }
  }, [dispatch]);

  const create = useCallback(async (data: ClassFormData) => {
    dispatch(setLoadingState({ operation: 'creating', loading: true }));
    dispatch(clearError('create'));
    try {
      const validation = validateAndPrepareClassData(data, false);
      if (!validation.isValid) throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      const req = validation.data as CreateClassRequest;
      const created = await createClass(req);
      const full = await classApiService.getClassById(created.id);
      dispatch(addClass(full));
      showSuccessMessage('Class Created', `${full.name} has been added.`);
      return full;
    } catch (error) {
      const msg = ClassErrorHandlers.create(error);
      dispatch(setError({ operation: 'create', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'creating', loading: false }));
    }
  }, [dispatch]);

  const update = useCallback(async (id: string, data: ClassFormData) => {
    dispatch(setLoadingState({ operation: 'updating', loading: true }));
    dispatch(clearError('update'));
    try {
      const validation = validateAndPrepareClassData(data, true);
      if (!validation.isValid) throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      const req = validation.data as UpdateClassRequest;
      const updated = await updateClass(id, req);
      dispatch(updateInStore(updated));
      showSuccessMessage('Class Updated', `${updated.name} has been updated.`);
      return updated;
    } catch (error) {
      const msg = ClassErrorHandlers.update(error);
      dispatch(setError({ operation: 'update', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'updating', loading: false }));
    }
  }, [dispatch]);

  const remove = useCallback(async (id: string, name: string) => {
    dispatch(setLoadingState({ operation: 'deleting', loading: true }));
    dispatch(clearError('delete'));
    try {
      await deleteClass(id);
      dispatch(deleteFromStore(id));
      showSuccessMessage('Class Deleted', `${name} has been removed.`);
    } catch (error) {
      const msg = ClassErrorHandlers.delete(error);
      dispatch(setError({ operation: 'delete', error: msg }));
      throw error;
    } finally {
      dispatch(setLoadingState({ operation: 'deleting', loading: false }));
    }
  }, [dispatch]);

  return {
    // state
    classes: state.isSearchMode ? state.searchResults : state.classes,
    all: state.classes,
    selectedClass: state.selectedClass,
    loading: state.loading,
    errors: state.errors,
    isSearchMode: state.isSearchMode,
    searchQuery: state.searchQuery,
    searchParams: state.searchParams,

    // actions
    loadClasses,
    search,
    create,
    update,
    remove,

    setSearchQuery: (q: string) => dispatch(setSearchQuery(q)),
    setSearchMode: (m: boolean) => dispatch(setSearchMode(m)),
    setSelectedClass: (c: ClassResponse | null) => dispatch(setSelectedClass(c)),
    clearAllErrors: () => dispatch(clearAllErrors()),
  };
};
