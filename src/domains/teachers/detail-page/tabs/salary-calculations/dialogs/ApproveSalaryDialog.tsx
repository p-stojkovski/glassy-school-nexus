/**
 * ApproveSalaryDialog - Dialog to approve a pending/reopened salary calculation
 * Phase 7.4 implementation
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  updateSalaryCalculation,
} from '@/domains/teachers/teachersSlice';
import { approveSalaryCalculation } from '@/services/teacherApiService';
import {
  approveSalarySchema,
  type ApproveSalaryFormData,
} from '../schemas/salaryDialogSchemas';
import { formatCurrency, formatPeriodFull } from '@/utils/formatters';
import { Amount } from '@/components/ui/amount';
import type { SalaryCalculation, SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface ApproveSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculation: SalaryCalculationDetail | null;
  onSuccess?: () => void;
}

export const ApproveSalaryDialog: React.FC<ApproveSalaryDialogProps> = ({
  open,
  onOpenChange,
  calculation,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.approvingSalaryCalculation
  );

  const form = useForm<ApproveSalaryFormData>({
    resolver: zodResolver(approveSalarySchema),
    defaultValues: {
      approvedAmount: calculation?.grandTotal || 0,
      reason: '',
    },
  });

  // Reset form when dialog opens or calculation changes
  useEffect(() => {
    if (open && calculation) {
      form.reset({
        approvedAmount: calculation.grandTotal,
        reason: '',
      });
    }
  }, [open, calculation, form]);

  // Watch approved amount to show reason field when it differs
  const approvedAmount = form.watch('approvedAmount');
  const isDifferent = calculation && approvedAmount !== calculation.grandTotal;

  const onSubmit = async (data: ApproveSalaryFormData) => {
    if (!teacherId || !calculation) return;

    try {
      dispatch(
        setLoadingState({ operation: 'approvingSalaryCalculation', loading: true })
      );
      dispatch(
        setError({ operation: 'approveSalaryCalculation', error: null })
      );

      const request = {
        approvedAmount: data.approvedAmount,
        adjustmentReason: isDifferent ? data.reason : undefined,
      };

      const result = await approveSalaryCalculation(teacherId, calculation.calculationId, request);

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
        title: 'Salary calculation approved',
        description: `Successfully approved calculation for ${formatCurrency(data.approvedAmount)}`,
        variant: 'default',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to approve salary calculation';
      dispatch(
        setError({ operation: 'approveSalaryCalculation', error: errorMessage })
      );
      toast({
        title: 'Approval failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'approvingSalaryCalculation', loading: false })
      );
    }
  };

  if (!calculation) return null;

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="success"
      size="md"
      icon={CheckCircle}
      title="Approve Salary Calculation"
      description="Review and approve the salary calculation. You can adjust the amount if needed."
      confirmText="Approve"
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
            <span className="text-sm text-white/70">Total Amount:</span>
            <Amount value={calculation.grandTotal} size="sm" weight="medium" className="text-white" />
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="approvedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Approved Amount (MKD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange(undefined);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? undefined : numValue);
                        }
                      }}
                      disabled={loading}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="Enter approved amount"
                    />
                  </FormControl>
                  <FormDescription className="text-white/50 text-xs">
                    Leave as calculated amount or adjust if needed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isDifferent && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">
                      Adjustment Reason <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={loading}
                        className="bg-white/5 border-white/20 text-white min-h-[80px] resize-none"
                        placeholder="Explain why the approved amount differs from the calculated amount..."
                      />
                    </FormControl>
                    <FormDescription className="text-white/50 text-xs">
                      Required when amount differs (minimum 10 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </Form>
      </div>
    </ActionDialog>
  );
};
