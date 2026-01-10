/**
 * ApproveSalaryDialog - Dialog to approve a pending/reopened salary calculation
 * Phase 7.4 implementation
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

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
      approvedAmount: calculation?.calculatedAmount || 0,
      reason: '',
    },
  });

  // Reset form when dialog opens or calculation changes
  useEffect(() => {
    if (open && calculation) {
      form.reset({
        approvedAmount: calculation.calculatedAmount,
        reason: '',
      });
    }
  }, [open, calculation, form]);

  // Watch approved amount to show reason field when it differs
  const approvedAmount = form.watch('approvedAmount');
  const isDifferent = calculation && approvedAmount !== calculation.calculatedAmount;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const formatPeriod = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

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

      // Update Redux state
      dispatch(updateSalaryCalculation(result.calculation));

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1f2e] border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Approve Salary Calculation
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Review and approve the salary calculation. You can adjust the amount if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Period:</span>
            <span className="text-sm text-white font-medium">
              {formatPeriod(calculation.periodStart, calculation.periodEnd)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Calculated Amount:</span>
            <span className="text-sm text-white font-medium">
              {formatCurrency(calculation.calculatedAmount)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="approvedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Approved Amount (MKD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
