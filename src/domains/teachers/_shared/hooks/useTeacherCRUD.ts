import { useCallback } from 'react';
import { useTeachers } from './useTeachers';
import { Teacher } from '../../teachersSlice';
import {
  teacherApiService,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '@/services/teacherApiService';
import {
  showSuccessMessage,
  TeacherErrorHandlers,
} from '@/utils/apiErrorHandler';
import {
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from '@/types/api/teacher';
import { validateAndPrepareTeacherData } from '@/utils/validation/teacherValidators';
import { clearCache } from '@/utils/cacheManager';
import { TeacherFormData } from './useTeacherManagement';

export interface UseTeacherCRUDOptions {
  onSuccess?: () => void;
}

export interface UseTeacherCRUDReturn {
  // Actions
  createTeacherApi: (data: TeacherFormData) => Promise<Teacher>;
  updateTeacherApi: (id: string, data: TeacherFormData) => Promise<Teacher>;
  deleteTeacherApi: (id: string, name: string) => Promise<void>;

  // Loading states (from Redux)
  loading: {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Error states (from Redux)
  errors: {
    create: string | null;
    update: string | null;
    delete: string | null;
  };

  // Redux actions (pass-through for composition)
  addTeacher: (data: Teacher) => void;
  updateTeacherInStore: (data: Teacher) => void;
  deleteTeacherFromStore: (id: string) => void;
  setLoadingState: (operation: string, loading: boolean) => void;
  setError: (operation: string, error: string | null) => void;
  clearError: (operation: string) => void;
}

export const useTeacherCRUD = (options?: UseTeacherCRUDOptions): UseTeacherCRUDReturn => {
  const {
    loading,
    errors,
    addTeacher,
    updateTeacher: updateTeacherInStore,
    deleteTeacher: deleteTeacherFromStore,
    setLoadingState,
    setError,
    clearError,
  } = useTeachers();

  // Create teacher
  const createTeacherApi = useCallback(async (data: TeacherFormData): Promise<Teacher> => {
    setLoadingState('creating', true);
    clearError('create');

    try {
      // Validate and prepare data
      const validation = validateAndPrepareTeacherData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }

      const request = validation.data as CreateTeacherRequest;
      const createdResponse = await createTeacher(request);

      // Fetch the created teacher to get full data
      const createdTeacher = await teacherApiService.getTeacherById(createdResponse.id);
      addTeacher(createdTeacher);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Created`, `${data.name} has been successfully added to the system.`);
      return createdTeacher;
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.create(error);
      setError('create', errorMessage);
      throw error;
    } finally {
      setLoadingState('creating', false);
    }
  }, [addTeacher, setLoadingState, setError, clearError]);

  // Update teacher
  const updateTeacherApi = useCallback(async (id: string, data: TeacherFormData): Promise<Teacher> => {
    setLoadingState('updating', true);
    clearError('update');

    try {
      // Validate and prepare data
      const validation = validateAndPrepareTeacherData(data, true);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || 'Validation failed');
      }

      const request = validation.data as UpdateTeacherRequest;
      const updatedTeacher = await updateTeacher(id, request);
      updateTeacherInStore(updatedTeacher);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Updated`, `${data.name} has been successfully updated.`);
      return updatedTeacher;
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.update(error);
      setError('update', errorMessage);
      throw error;
    } finally {
      setLoadingState('updating', false);
    }
  }, [updateTeacherInStore, setLoadingState, setError, clearError]);

  // Delete teacher
  const deleteTeacherApi = useCallback(async (id: string, name: string): Promise<void> => {
    setLoadingState('deleting', true);
    clearError('delete');

    try {
      await deleteTeacher(id);
      deleteTeacherFromStore(id);

      // Clear teachers cache so other components refresh on next mount
      clearCache('teachers');

      showSuccessMessage(`Teacher Deleted`, `${name} has been successfully removed from the system.`);
    } catch (error) {
      const errorMessage = TeacherErrorHandlers.delete(error);
      setError('delete', errorMessage);
      throw error;
    } finally {
      setLoadingState('deleting', false);
    }
  }, [deleteTeacherFromStore, setLoadingState, setError, clearError]);

  return {
    // Actions
    createTeacherApi,
    updateTeacherApi,
    deleteTeacherApi,

    // Loading states
    loading: {
      creating: loading.creating,
      updating: loading.updating,
      deleting: loading.deleting,
    },

    // Error states
    errors: {
      create: errors.create,
      update: errors.update,
      delete: errors.delete,
    },

    // Redux actions (pass-through)
    addTeacher,
    updateTeacherInStore,
    deleteTeacherFromStore,
    setLoadingState,
    setError,
    clearError,
  };
};
