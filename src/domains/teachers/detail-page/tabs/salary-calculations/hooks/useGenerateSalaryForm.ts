/**
 * useGenerateSalaryForm - Form state management and submission for salary generation
 * Extracted from GenerateSalaryDialog.tsx (Phase 3.1 refactoring)
 * 
 * Purpose: Handles form initialization, validation, submission, and error handling
 */
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  addSalaryCalculation,
} from '@/domains/teachers/teachersSlice';
import { generateSalaryCalculation } from '@/services/teacherApiService';
import {
  generateSalarySchema,
  type GenerateSalaryFormData,
} from '../schemas/salaryDialogSchemas';
import type { SalaryCalculation } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { MONTHS } from '@/domains/teachers/_shared/constants';

export interface UseGenerateSalaryFormOptions {
  /**
   * Teacher ID for the salary calculation
   */
  teacherId: string;
  
  /**
   * Callback when generation succeeds
   */
  onSuccess?: () => void;
  
  /**
   * Callback to close the dialog
   */
  onClose: () => void;
}

export interface UseGenerateSalaryFormReturn {
  /**
   * react-hook-form instance
   */
  form: ReturnType<typeof useForm<GenerateSalaryFormData>>;
  
  /**
   * Currently selected year from form
   */
  selectedYear: number;
  
  /**
   * Submit handler for the form
   */
  onSubmit: (data: GenerateSalaryFormData) => Promise<void>;
  
  /**
   * Loading state for generation
   */
  loading: boolean;
  
  /**
   * Available year options
   */
  yearOptions: number[];
}

/**
 * Hook to manage form state and submission for salary generation
 */
export const useGenerateSalaryForm = ({
  teacherId,
  onSuccess,
  onClose,
}: UseGenerateSalaryFormOptions): UseGenerateSalaryFormReturn => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.generatingSalaryCalculation
  );

  // Default to current month/year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  // Generate year options (current year only - no past years)
  const yearOptions = [currentYear];

  // Initialize form
  const form = useForm<GenerateSalaryFormData>({
    resolver: zodResolver(generateSalarySchema),
    defaultValues: {
      year: currentYear,
      month: currentMonth,
    },
  });

  // Watch selected year to update disabled months
  const selectedYear = useWatch({
    control: form.control,
    name: 'year',
  }) ?? currentYear;

  // Submit handler
  const onSubmit = async (data: GenerateSalaryFormData) => {
    if (!teacherId) return;

    try {
      dispatch(
        setLoadingState({ operation: 'generatingSalaryCalculation', loading: true })
      );
      dispatch(
        setError({ operation: 'generateSalaryCalculation', error: null })
      );

      // Calculate period start and end dates
      // Use direct string formatting to avoid timezone conversion issues
      // (toISOString() converts to UTC which can shift dates back by 1 day in positive timezones)
      const lastDay = new Date(data.year, data.month, 0).getDate();
      const periodStart = `${data.year}-${String(data.month).padStart(2, '0')}-01`;
      const periodEnd = `${data.year}-${String(data.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const request = {
        periodStart,
        periodEnd,
      };

      const result = await generateSalaryCalculation(teacherId, request);

      // Transform SalaryCalculationDetail to SalaryCalculation format
      const newCalculation: SalaryCalculation = {
        id: result.calculationId,
        teacherId: result.teacherId,
        teacherName: '', // Not included in detail response, will be updated from list
        academicYearId: result.academicYearId,
        periodStart: result.periodStart,
        periodEnd: result.periodEnd,
        calculatedAmount: result.calculatedAmount,
        baseSalaryAmount: result.baseSalaryAmount,
        approvedAmount: result.approvedAmount,
        status: result.status,
        approvedAt: result.approvedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      // Add to Redux state
      dispatch(addSalaryCalculation(newCalculation));

      const monthName = MONTHS.find(m => m.value === data.month)?.label || '';

      toast({
        title: 'Salary calculation generated',
        description: `Successfully generated calculation for ${monthName} ${data.year}`,
        variant: 'default',
      });

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage =
        error?.message || 'Failed to generate salary calculation';
      dispatch(
        setError({ operation: 'generateSalaryCalculation', error: errorMessage })
      );
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'generatingSalaryCalculation', loading: false })
      );
    }
  };

  return {
    form,
    selectedYear,
    onSubmit,
    loading,
    yearOptions,
  };
};
