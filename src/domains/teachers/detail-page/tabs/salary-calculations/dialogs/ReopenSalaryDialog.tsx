/**
 * ReopenSalaryDialog - Dialog to reopen an approved salary calculation
 * Phase 7.4 implementation
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { ActionDialog } from '@/components/common/dialogs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  updateSalaryCalculation,
} from '@/domains/teachers/teachersSlice';
import { reopenSalaryCalculation } from '@/services/teacherApiService';
import {
  reopenSalarySchema,
  type ReopenSalaryFormData,
} from '../schemas/salaryDialogSchemas';
import { formatPeriodFull } from '@/utils/formatters';
import { Amount } from '@/components/ui/amount';
import type { SalaryCalculation, SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface ReopenSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculation: SalaryCalculationDetail | null;
  onSuccess?: () => void;
}

export const ReopenSalaryDialog: React.FC<ReopenSalaryDialogProps> = ({
  open,
  onOpenChange,
  calculation,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.reopeningSalaryCalculation
  );

  const form = useForm<ReopenSalaryFormData>({
    resolver: zodResolver(reopenSalarySchema),
    defaultValues: {
      reason: '',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        reason: '',
      });
    }
  }, [open, form]);

  const onSubmit = async (data: ReopenSalaryFormData) => {
    if (!teacherId || !calculation) return;

    try {
      dispatch(
        setLoadingState({ operation: 'reopeningSalaryCalculation', loading: true })
      );
      dispatch(
        setError({ operation: 'reopenSalaryCalculation', error: null })
      );

      const request = {
        reason: data.reason,
      };

      const result = await reopenSalaryCalculation(teacherId, calculation.calculationId, request);

      // Transform SalaryCalculationDetail to SalaryCalculation format
      const updatedCalculation: SalaryCalculation = {
        id: result.calculationId,
        teacherId: result.teacherId,
        teacherName: '', // Not included in detail response, will be updated from list
        academicYearId: result.academicYearId,
        periodStart: result.periodStart,
        periodEnd: result.periodEnd,
        calculatedAmount: result.calculatedAmount,
        approvedAmount: result.approvedAmount,
        status: result.status,
        approvedAt: result.approvedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      // Update Redux state
      dispatch(updateSalaryCalculation(updatedCalculation));

      toast({
        title: 'Salary calculation reopened',
        description: 'Successfully reopened calculation for review',
        variant: 'default',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to reopen salary calculation';
      dispatch(
        setError({ operation: 'reopenSalaryCalculation', error: errorMessage })
      );
      toast({
        title: 'Reopen failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'reopeningSalaryCalculation', loading: false })
      );
    }
  };

  if (!calculation) return null;

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="warning"
      size="md"
      icon={RotateCcw}
      title="Reopen Salary Calculation"
      description="Reopen an approved calculation for revision. This will change its status back to pending."
      confirmText="Reopen"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={loading}
    >
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Period:</span>
            <span className="text-sm text-white font-medium">
              {formatPeriodFull(calculation.periodStart, calculation.periodEnd)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Approved Amount:</span>
            {calculation.approvedAmount !== null ? (
              <Amount value={calculation.approvedAmount} size="sm" weight="medium" className="text-white" />
            ) : (
              <span className="text-sm text-white font-medium">-</span>
            )}
          </div>
        </div>

        <Form {...form}>
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">
                  Reason for Reopening <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={loading}
                    className="bg-white/5 border-white/20 text-white min-h-[100px] resize-none"
                    placeholder="Explain why this calculation needs to be reopened..."
                  />
                </FormControl>
                <FormDescription className="text-white/50 text-xs">
                  Required (minimum 10 characters, maximum 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
    </ActionDialog>
  );
};
