import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  TeacherPaymentRateResponse,
  TeacherPaymentRatesResponse,
  TeacherPaymentRatesStats,
  SetTeacherPaymentRateRequest,
  UpdateTeacherPaymentRateRequest,
} from '@/types/api/teacherPaymentRate';
import {
  getTeacherPaymentRates,
  setTeacherPaymentRate,
  updateTeacherPaymentRate,
  deleteTeacherPaymentRate,
} from '@/services/teacherApiService';

interface UseTeacherPaymentRatesOptions {
  teacherId: string;
  includeInactive?: boolean;
}

interface UseTeacherPaymentRatesResult {
  rates: TeacherPaymentRateResponse[];
  stats: TeacherPaymentRatesStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setRate: (request: SetTeacherPaymentRateRequest) => Promise<void>;
  updateRate: (rateId: string, request: UpdateTeacherPaymentRateRequest) => Promise<void>;
  deleteRate: (rateId: string) => Promise<void>;
  getRateForClass: (classId: string) => TeacherPaymentRateResponse | undefined;
}

/**
 * Hook for managing teacher payment rates
 * Provides CRUD operations and data fetching for payment rates
 */
export function useTeacherPaymentRates({
  teacherId,
  includeInactive = false,
}: UseTeacherPaymentRatesOptions): UseTeacherPaymentRatesResult {
  const [rates, setRates] = useState<TeacherPaymentRateResponse[]>([]);
  const [stats, setStats] = useState<TeacherPaymentRatesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch payment rates from the API
   */
  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: TeacherPaymentRatesResponse = await getTeacherPaymentRates(
        teacherId,
        includeInactive
      );
      setRates(response.rates);
      setStats(response.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment rates';
      setError(errorMessage);
      console.error('Error loading payment rates:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, includeInactive]);

  /**
   * Set a new payment rate
   */
  const setRateMutation = useCallback(
    async (request: SetTeacherPaymentRateRequest) => {
      try {
        await setTeacherPaymentRate(teacherId, request);
        toast.success('Payment rate set successfully');
        await loadRates();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set payment rate';
        toast.error(errorMessage);
        throw err;
      }
    },
    [teacherId, loadRates]
  );

  /**
   * Update an existing payment rate
   */
  const updateRateMutation = useCallback(
    async (rateId: string, request: UpdateTeacherPaymentRateRequest) => {
      try {
        await updateTeacherPaymentRate(teacherId, rateId, request);
        toast.success('Payment rate updated successfully');
        await loadRates();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update payment rate';
        toast.error(errorMessage);
        throw err;
      }
    },
    [teacherId, loadRates]
  );

  /**
   * Delete (deactivate) a payment rate
   */
  const deleteRateMutation = useCallback(
    async (rateId: string) => {
      try {
        await deleteTeacherPaymentRate(teacherId, rateId);
        toast.success('Payment rate deactivated successfully');
        await loadRates();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment rate';
        toast.error(errorMessage);
        throw err;
      }
    },
    [teacherId, loadRates]
  );

  /**
   * Get the active rate for a specific class
   */
  const getRateForClass = useCallback(
    (classId: string) => {
      return rates.find((rate) => rate.classId === classId && rate.effectiveTo === null);
    },
    [rates]
  );

  // Load rates on mount and when dependencies change
  useEffect(() => {
    loadRates();
  }, [loadRates]);

  return {
    rates,
    stats,
    loading,
    error,
    refresh: loadRates,
    setRate: setRateMutation,
    updateRate: updateRateMutation,
    deleteRate: deleteRateMutation,
    getRateForClass,
  };
}
