import { useState, useEffect, useCallback } from 'react';
import discountTypeApiService, { DiscountType } from '@/services/discountTypeApiService';

export interface UseDiscountTypesResult {
  discountTypes: DiscountType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DISCOUNT_TYPES_STORAGE_KEY = 'think-english-discount-types';

// Helper functions for localStorage
const getDiscountTypesFromStorage = (): DiscountType[] | null => {
  try {
    const stored = localStorage.getItem(DISCOUNT_TYPES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DiscountType[];
    }
  } catch (error) {
    console.warn('Failed to parse discount types from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(DISCOUNT_TYPES_STORAGE_KEY);
  }
  return null;
};

const setDiscountTypesToStorage = (discountTypes: DiscountType[]): void => {
  try {
    localStorage.setItem(DISCOUNT_TYPES_STORAGE_KEY, JSON.stringify(discountTypes));
  } catch (error) {
    console.warn('Failed to store discount types in localStorage:', error);
  }
};

export const useDiscountTypes = (): UseDiscountTypesResult => {
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscountTypes = useCallback(async (forceRefresh = false) => {
    // Check localStorage first (unless force refresh)
    if (!forceRefresh) {
      const cachedDiscountTypes = getDiscountTypesFromStorage();
      if (cachedDiscountTypes && cachedDiscountTypes.length > 0) {
        // Filter only active discount types for dropdown usage
        const activeDiscountTypes = cachedDiscountTypes.filter(dt => dt.isActive);
        setDiscountTypes(activeDiscountTypes);
        setError(null);
        return;
      }
    }

    // Fetch from API
    setIsLoading(true);
    setError(null);
    
    try {
      const discountTypesData = await discountTypeApiService.getAll();
      // Filter only active discount types for dropdown usage
      const activeDiscountTypes = discountTypesData.filter(dt => dt.isActive);
      setDiscountTypes(activeDiscountTypes);
      // Cache all results (including inactive ones)
      setDiscountTypesToStorage(discountTypesData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch discount types';
      setError(errorMessage);
      console.error('Error fetching discount types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Force refresh function that bypasses cache
  const refetchFromApi = useCallback(async () => {
    await fetchDiscountTypes(true);
  }, [fetchDiscountTypes]);

  useEffect(() => {
    fetchDiscountTypes();
  }, [fetchDiscountTypes]);

  return {
    discountTypes,
    isLoading,
    error,
    refetch: refetchFromApi,
  };
};
