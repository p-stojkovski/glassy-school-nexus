import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Receipt } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createFeeTemplateSchema,
  type CreateFeeTemplateFormData,
  FEE_TYPE_OPTIONS,
  RECURRENCE_INTERVAL_OPTIONS,
  getCreateFeeTemplateDefaults,
} from '@/domains/classes/schemas/feeTemplateSchema';
import type { CreateClassFeeTemplateRequest } from '@/types/api/classFees';

interface CreateFeeTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClassFeeTemplateRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateFeeTemplateSheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateFeeTemplateSheetProps) {
  const form = useForm<CreateFeeTemplateFormData>({
    resolver: zodResolver(createFeeTemplateSchema),
    defaultValues: getCreateFeeTemplateDefaults(),
  });

  const isRecurring = form.watch('isRecurring');

  const handleSubmit = async (data: CreateFeeTemplateFormData) => {
    const request: CreateClassFeeTemplateRequest = {
      feeType: data.feeType,
      name: data.name.trim(),
      amount: data.amount,
      isRecurring: data.isRecurring,
      recurrenceInterval: data.isRecurring ? (data.recurrenceInterval ?? undefined) : undefined,
      isOptional: data.isOptional,
      effectiveFrom: data.effectiveFrom,
      sortOrder: data.sortOrder,
    };
    await onSubmit(request);
    form.reset(getCreateFeeTemplateDefaults());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset(getCreateFeeTemplateDefaults());
    }
    onOpenChange(newOpen);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={handleOpenChange}
      intent="primary"
      size="sm"
      icon={Receipt}
      title="Create Fee Template"
      description="Define a new fee template for this class"
      confirmText="Create Template"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
      isDirty={form.formState.isDirty}
    >
      <Form {...form}>
        <form className="space-y-4">
          {/* Fee Type */}
          <FormField
            control={form.control}
            name="feeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Fee Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FEE_TYPE_OPTIONS.map((option) => (
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

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Monthly Tuition"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Amount (MKD) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Is Recurring */}
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">Recurring Fee</FormLabel>
                  <FormDescription className="text-white/60">
                    Check this if the fee is charged on a regular schedule
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Recurrence Interval (shown only if isRecurring) */}
          {isRecurring && (
            <FormField
              control={form.control}
              name="recurrenceInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Recurrence Interval *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECURRENCE_INTERVAL_OPTIONS.map((option) => (
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
          )}

          {/* Is Optional */}
          <FormField
            control={form.control}
            name="isOptional"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">Optional Fee</FormLabel>
                  <FormDescription className="text-white/60">
                    Check this if the fee is optional (not required for all students)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Effective From */}
          <FormField
            control={form.control}
            name="effectiveFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Effective From *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-white/60">
                  The date from which this fee template becomes active
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sort Order */}
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Sort Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription className="text-white/60">
                  Lower numbers appear first (default: 0)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormSheet>
  );
}
