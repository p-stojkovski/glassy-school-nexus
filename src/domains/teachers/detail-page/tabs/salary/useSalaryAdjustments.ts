import { useState, useCallback } from 'react';
import {
  createSalaryAdjustment,
  updateSalaryAdjustment,
  deleteSalaryAdjustment,
} from '@/services/teacherApiService';
import {
  SalaryAdjustmentResponse,
  CreateSalaryAdjustmentRequest,
  UpdateSalaryAdjustmentRequest,
} from '@/types/api/teacherSalary';

interface UseSalaryAdjustmentsOptions {
  teacherId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseSalaryAdjustmentsResult {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  createAdjustment: (request: CreateSalaryAdjustmentRequest) => Promise<SalaryAdjustmentResponse | null>;
  updateAdjustment: (adjustmentId: string, request: UpdateSalaryAdjustmentRequest) => Promise<SalaryAdjustmentResponse | null>;
  deleteAdjustment: (adjustmentId: string) => Promise<boolean>;
  error: string | null;
}

/**
 * Hook to manage salary adjustments CRUD operations
 */
export function useSalaryAdjustments({
  teacherId,
  onSuccess,
  onError,
}: UseSalaryAdjustmentsOptions): UseSalaryAdjustmentsResult {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAdjustment = useCallback(
    async (request: CreateSalaryAdjustmentRequest): Promise<SalaryAdjustmentResponse | null> => {
      setCreating(true);
      setError(null);

      try {
        const result = await createSalaryAdjustment(teacherId, request);
        onSuccess?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create adjustment';
        setError(message);
        onError?.(message);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [teacherId, onSuccess, onError]
  );

  const handleUpdateAdjustment = useCallback(
    async (
      adjustmentId: string,
      request: UpdateSalaryAdjustmentRequest
    ): Promise<SalaryAdjustmentResponse | null> => {
      setUpdating(true);
      setError(null);

      try {
        const result = await updateSalaryAdjustment(teacherId, adjustmentId, request);
        onSuccess?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update adjustment';
        setError(message);
        onError?.(message);
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [teacherId, onSuccess, onError]
  );

  const handleDeleteAdjustment = useCallback(
    async (adjustmentId: string): Promise<boolean> => {
      setDeleting(true);
      setError(null);

      try {
        await deleteSalaryAdjustment(teacherId, adjustmentId);
        onSuccess?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete adjustment';
        setError(message);
        onError?.(message);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [teacherId, onSuccess, onError]
  );

  return {
    creating,
    updating,
    deleting,
    createAdjustment: handleCreateAdjustment,
    updateAdjustment: handleUpdateAdjustment,
    deleteAdjustment: handleDeleteAdjustment,
    error,
  };
}
