import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { DiscountType } from '@/services/discountTypeApiService';

// Discount type form validation schema - matches API requirements
const discountTypeSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(50, 'Key must be ≤50 characters')
    .regex(/^[a-z_]+$/, 'Key must be lowercase with underscores only'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be ≤100 characters'),
  description: z
    .string()
    .max(500, 'Description must be ≤500 characters')
    .optional(),
  requiresAmount: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z
    .number()
    .min(0, 'Sort order must be ≥ 0'),
});

export type DiscountTypeFormData = z.infer<typeof discountTypeSchema>;

interface DiscountTypeFormProps {
  discountType?: DiscountType | null;
  onSubmit: (data: DiscountTypeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DiscountTypeForm: React.FC<DiscountTypeFormProps> = ({
  discountType,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<DiscountTypeFormData>({
    resolver: zodResolver(discountTypeSchema),
    defaultValues: {
      key: '',
      name: '',
      description: '',
      requiresAmount: false,
      isActive: true,
      sortOrder: 0,
    },
  });

  // Update form when discount type changes (for editing)
  useEffect(() => {
    if (discountType) {
      form.reset({
        key: discountType.key,
        name: discountType.name,
        description: discountType.description,
        requiresAmount: discountType.requiresAmount,
        isActive: discountType.isActive,
        sortOrder: discountType.sortOrder,
      });
    } else {
      form.reset({
        key: '',
        name: '',
        description: '',
        requiresAmount: false,
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [discountType, form]);

  const handleSubmit = async (data: DiscountTypeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit discount type form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Discount Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter discount name (e.g., Employee Discount)"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Discount Key *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter unique key (e.g., employee_discount)"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Lowercase letters and underscores only, max 50 characters
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe when this discount applies..."
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[80px]"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Sort Order *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Lower numbers appear first in lists
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiresAmount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-white/20 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white font-semibold">
                  Requires Amount
                </FormLabel>
                <p className="text-xs text-white/50">
                  Check if this discount type requires a specific amount to be entered
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-white/20 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white font-semibold">
                  Active
                </FormLabel>
                <p className="text-xs text-white/50">
                  Active discount types are available for selection when creating student profiles
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormButtons
          submitText={discountType ? 'Update Discount Type' : 'Add Discount Type'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default DiscountTypeForm;
