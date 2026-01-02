import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SalaryAdjustmentResponse } from '@/types/api/teacherSalary';

const adjustmentSchema = z.object({
  adjustmentType: z.enum(['bonus', 'deduction'], {
    required_error: 'Please select an adjustment type',
  }),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Amount must be greater than 0'
    )
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) <= 999999.99,
      'Amount cannot exceed 999,999.99'
    ),
  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

interface AddAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  editingAdjustment?: SalaryAdjustmentResponse | null;
  onSubmit: (data: {
    adjustmentType: 'bonus' | 'deduction';
    amount: number;
    reason: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function AddAdjustmentDialog({
  open,
  onOpenChange,
  year,
  month,
  editingAdjustment,
  onSubmit,
  loading = false,
}: AddAdjustmentDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: 'bonus',
      amount: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (editingAdjustment) {
      form.reset({
        adjustmentType: editingAdjustment.adjustmentType,
        amount: editingAdjustment.amount.toString(),
        reason: editingAdjustment.reason,
      });
    } else {
      form.reset({
        adjustmentType: 'bonus',
        amount: '',
        reason: '',
      });
    }
  }, [editingAdjustment, form, open]);

  const handleSubmit = async (values: AdjustmentFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit({
        adjustmentType: values.adjustmentType,
        amount: parseFloat(values.amount),
        reason: values.reason,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to submit adjustment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-white/20 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingAdjustment ? 'Edit Adjustment' : 'Add Salary Adjustment'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {editingAdjustment
              ? 'Update the salary adjustment details'
              : `Add a bonus or deduction for ${monthNames[month - 1]} ${year}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-white/20 text-white">
                      <SelectItem value="bonus" className="focus:bg-white/10">
                        🟢 Bonus (Addition)
                      </SelectItem>
                      <SelectItem value="deduction" className="focus:bg-white/10">
                        🔴 Deduction (Subtraction)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Amount (USD)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999.99"
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter the reason for this adjustment..."
                      rows={4}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting || loading}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loading}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {submitting || loading ? 'Saving...' : editingAdjustment ? 'Update' : 'Add Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
