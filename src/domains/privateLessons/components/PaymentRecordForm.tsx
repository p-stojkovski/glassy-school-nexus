import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { PrivateLesson, PaymentRecord } from '../privateLessonsSlice';
import { PaymentMethod } from '@/types/enums';
import {
  usePrivateLessonsManagement,
  PaymentRecordFormData as HookPaymentRecordFormData,
} from '../hooks/usePrivateLessonsManagement';

const paymentRecordSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
});

type PaymentRecordFormData = z.infer<typeof paymentRecordSchema>;

interface PaymentRecordFormProps {
  lesson: PrivateLesson;
  paymentRecord?: PaymentRecord;
  onSubmit: () => void;
  onCancel: () => void;
}

const PaymentRecordForm: React.FC<PaymentRecordFormProps> = ({
  lesson,
  paymentRecord,
  onSubmit,
  onCancel,
}) => {
  const { handleAddPaymentRecord, handleUpdatePaymentRecord } =
    usePrivateLessonsManagement();
  const isEditing = !!paymentRecord;

  const form = useForm<PaymentRecordFormData>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      amount: paymentRecord?.amount || 0,
      paymentDate: paymentRecord?.paymentDate
        ? paymentRecord.paymentDate.split('T')[0]
        : '', // Format for date input
      method: paymentRecord?.method || PaymentMethod.Cash,
      notes: paymentRecord?.notes || '',
    },
  });

  const handleFormSubmit = async (data: PaymentRecordFormData) => {
    try {
      const recordData: HookPaymentRecordFormData = {
        amount: data.amount,
        paymentDate: new Date(data.paymentDate).toISOString(),
        method: data.method,
        notes: data.notes,
      };

      if (isEditing && paymentRecord) {
        await handleUpdatePaymentRecord(
          lesson.id,
          paymentRecord.id,
          recordData
        );
      } else {
        await handleAddPaymentRecord(lesson.id, recordData);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save payment record:', error);
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
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Payment Date</FormLabel>
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
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem
                    value={PaymentMethod.Cash}
                    className="text-white focus:bg-white/10"
                  >
                    Cash
                  </SelectItem>
                  <SelectItem
                    value={PaymentMethod.Card}
                    className="text-white focus:bg-white/10"
                  >
                    Card
                  </SelectItem>
                  <SelectItem
                    value={PaymentMethod.Transfer}
                    className="text-white focus:bg-white/10"
                  >
                    Bank Transfer
                  </SelectItem>
                  <SelectItem
                    value={PaymentMethod.Other}
                    className="text-white focus:bg-white/10"
                  >
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Add any notes about this payment..."
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
          submitText={isEditing ? 'Update Payment' : 'Record Payment'}
          onCancel={onCancel}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
};

export default PaymentRecordForm;
