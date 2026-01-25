import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectDiscountTypes,
  selectDiscountTypesLoading,
  selectDiscountTypesErrors,
  setDiscountTypes,
  addDiscountType,
  updateDiscountType as updateDiscountTypeAction,
  removeDiscountType,
  setDiscountTypesLoading,
  setDiscountTypesError,
} from '../../settingsSlice';
import discountTypeApiService from '@/services/discountTypeApiService';
import type { CreateDiscountTypeRequest, UpdateDiscountTypeRequest } from '@/domains/settings/types/discountTypeTypes';
import type { DiscountTypeFormData } from '../schemas/discountTypeSchemas';

const CACHE_KEY = 'think-english-discount-types';

export function useDiscountTypes() {
  const dispatch = useAppDispatch();
  const discountTypes = useAppSelector(selectDiscountTypes);
  const loading = useAppSelector(selectDiscountTypesLoading);
  const errors = useAppSelector(selectDiscountTypesErrors);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const fetchDiscountTypes = useCallback(async () => {
    dispatch(setDiscountTypesLoading({ operation: 'fetching', loading: true }));
    dispatch(setDiscountTypesError({ operation: 'fetch', error: null }));

    try {
      const data = await discountTypeApiService.getAll();
      const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
      dispatch(setDiscountTypes(sorted));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load discount types';
      dispatch(setDiscountTypesError({ operation: 'fetch', error: message }));
      toast.error(message);
    } finally {
      dispatch(setDiscountTypesLoading({ operation: 'fetching', loading: false }));
    }
  }, [dispatch]);

  const createDiscountType = useCallback(async (data: DiscountTypeFormData): Promise<boolean> => {
    dispatch(setDiscountTypesLoading({ operation: 'creating', loading: true }));
    dispatch(setDiscountTypesError({ operation: 'create', error: null }));

    try {
      const request: CreateDiscountTypeRequest = {
        key: data.key,
        name: data.name,
        description: data.description || undefined,
        requiresAmount: data.requiresAmount,
        sortOrder: data.sortOrder,
      };
      const newDiscountType = await discountTypeApiService.create(request);
      dispatch(addDiscountType(newDiscountType));
      clearCache();
      toast.success('Discount type created successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Discount type with this key already exists');
        dispatch(setDiscountTypesError({ operation: 'create', error: 'Discount type with this key already exists' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create discount type';
        dispatch(setDiscountTypesError({ operation: 'create', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setDiscountTypesLoading({ operation: 'creating', loading: false }));
    }
  }, [dispatch, clearCache]);

  const updateDiscountType = useCallback(async (id: number, data: DiscountTypeFormData): Promise<boolean> => {
    dispatch(setDiscountTypesLoading({ operation: 'updating', loading: true }));
    dispatch(setDiscountTypesError({ operation: 'update', error: null }));

    try {
      const request: UpdateDiscountTypeRequest = {
        key: data.key,
        name: data.name,
        description: data.description || undefined,
        requiresAmount: data.requiresAmount,
        sortOrder: data.sortOrder,
      };
      const updatedDiscountType = await discountTypeApiService.update(id, request);
      dispatch(updateDiscountTypeAction(updatedDiscountType));
      clearCache();
      toast.success('Discount type updated successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Discount type with this key already exists');
        dispatch(setDiscountTypesError({ operation: 'update', error: 'Discount type with this key already exists' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update discount type';
        dispatch(setDiscountTypesError({ operation: 'update', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setDiscountTypesLoading({ operation: 'updating', loading: false }));
    }
  }, [dispatch, clearCache]);

  const deleteDiscountType = useCallback(async (id: number): Promise<boolean> => {
    dispatch(setDiscountTypesLoading({ operation: 'deleting', loading: true }));
    dispatch(setDiscountTypesError({ operation: 'delete', error: null }));

    try {
      await discountTypeApiService.delete(id);
      dispatch(removeDiscountType(id));
      clearCache();
      toast.success('Discount type deleted successfully');
      return true;
    } catch (error: unknown) {
      // Handle 409 conflict specially (discount type in use)
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('Cannot delete discount type: it is currently in use by students');
        dispatch(setDiscountTypesError({ operation: 'delete', error: 'Cannot delete discount type: it is currently in use by students' }));
      } else {
        const message = error instanceof Error ? error.message : 'Failed to delete discount type';
        dispatch(setDiscountTypesError({ operation: 'delete', error: message }));
        toast.error(message);
      }
      return false;
    } finally {
      dispatch(setDiscountTypesLoading({ operation: 'deleting', loading: false }));
    }
  }, [dispatch, clearCache]);

  return {
    discountTypes,
    loading,
    errors,
    fetchDiscountTypes,
    createDiscountType,
    updateDiscountType,
    deleteDiscountType,
  };
}
