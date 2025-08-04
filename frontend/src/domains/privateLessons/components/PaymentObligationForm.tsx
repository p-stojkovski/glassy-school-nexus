import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { PrivateLesson, PaymentObligation } from '../privateLessonsSlice';
import { ObligationStatus } from '@/types/enums';
import {
  usePrivateLessonsManagement,
  PaymentObligationFormData as HookPaymentObligationFormData,
} from '../hooks/usePrivateLessonsManagement';

const paymentObligationSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

type PaymentObligationFormData = z.infer<typeof paymentObligationSchema>;

interface PaymentObligationFormProps {
  lesson: PrivateLesson;
  obligation?: PaymentObligation;
  onSubmit: () => void;
  onCancel: () => void;
}

const PaymentObligationForm: React.FC<PaymentObligationFormProps> = ({
  lesson,
  obligation,
  onSubmit,
  onCancel,
}) => {
  const { handleSetPaymentObligation, handleUpdatePaymentObligation } =
    usePrivateLessonsManagement();
  const isEditing = !!obligation;

  const form = useForm<PaymentObligationFormData>({
    resolver: zodResolver(paymentObligationSchema),
    defaultValues: {
      amount: obligation?.amount || 0,
      dueDate: obligation?.dueDate ? obligation.dueDate.split('T')[0] : '', // Format for date input
      notes: obligation?.notes || '',
    },
  });

  const handleFormSubmit = async (data: PaymentObligationFormData) => {
    try {
      const obligationData: HookPaymentObligationFormData = {
        amount: data.amount,
        dueDate: new Date(data.dueDate).toISOString(),
        notes: data.notes,
      };

      if (isEditing && obligation) {
        await handleUpdatePaymentObligation(
          lesson.id,
          obligation.id,
          obligationData
        );
      } else {
        await handleSetPaymentObligation(lesson.id, obligationData);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save payment obligation:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Due Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this payment obligation..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormButtons
          submitText={isEditing ? 'Update Obligation' : 'Set Obligation'}
          onCancel={onCancel}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
};

export default PaymentObligationForm;
