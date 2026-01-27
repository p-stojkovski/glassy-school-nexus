/**
 * Register Payment Dialog
 * Allows teachers to record a payment against a student's obligation
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard } from 'lucide-react';
import { ActionDialog } from '@/components/common/dialogs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Amount } from '@/components/ui/amount';
import { toast } from 'sonner';
import {
  createPaymentSchemaWithMax,
  getPaymentDefaults,
  PAYMENT_METHOD_OPTIONS,
  type PaymentFormData,
} from '@/domains/classes/schemas/paymentSchema';
import { createPayment } from '@/services/paymentsApiService';
import type { StudentObligation, CreatePaymentRequest } from '@/types/api/obligations';

interface RegisterPaymentDialogProps {
  obligation: StudentObligation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function RegisterPaymentDialog({
  obligation,
  open,
  onOpenChange,
  onSuccess,
}: RegisterPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create dynamic schema with max validation based on remaining amount
  const paymentSchema = createPaymentSchemaWithMax(obligation.remainingAmount);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: getPaymentDefaults(obligation.remainingAmount),
  });

  // Reset form when dialog opens with new obligation data
  useEffect(() => {
    if (open) {
      form.reset(getPaymentDefaults(obligation.remainingAmount));
    }
  }, [open, obligation.remainingAmount, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const request: CreatePaymentRequest = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
      };

      await createPayment(obligation.id, request);

      toast.success(
        `Payment of ${data.amount.toLocaleString()} MKD recorded successfully`
      );
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="md"
      icon={CreditCard}
      title="Register Payment"
      description={`Record a payment for ${obligation.studentName}`}
      confirmText="Record Payment"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
      disabled={!form.formState.isValid}
    >
      <div className="space-y-4">
        {/* Obligation Info Panel */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Obligation:</span>
            <span className="text-sm text-white font-medium">
              {obligation.description}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Total Amount:</span>
            <Amount value={obligation.finalAmount} size="sm" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Already Paid:</span>
            <Amount value={obligation.paidAmount} size="sm" />
          </div>
          <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
            <span className="text-sm text-white/70 font-medium">
              Remaining Balance:
            </span>
            <Amount
              value={obligation.remainingAmount}
              size="sm"
              weight="semibold"
              className="text-yellow-400"
            />
          </div>
        </div>

        {/* Payment Form */}
        <Form {...form}>
          <div className="space-y-4">
            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Amount (MKD) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={obligation.remainingAmount}
                      placeholder="Enter payment amount"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method Field */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Payment Method *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Date Field */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Payment Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Number Field (Optional) */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Reference Number{' '}
                    <span className="text-white/40">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Transaction ID, receipt number, etc."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field (Optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Notes <span className="text-white/40">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about this payment..."
                      rows={2}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </div>
    </ActionDialog>
  );
}
