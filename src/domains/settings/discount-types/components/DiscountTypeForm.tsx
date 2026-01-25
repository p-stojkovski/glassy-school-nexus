import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { discountTypeSchema, type DiscountTypeFormData } from '../schemas/discountTypeSchemas';
import type { DiscountType } from '@/domains/settings/types/discountTypeTypes';

interface DiscountTypeFormProps {
  discountType: DiscountType | null;
  onSubmit: (data: DiscountTypeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DiscountTypeForm: React.FC<DiscountTypeFormProps> = ({
  discountType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = discountType !== null;

  const form = useForm<DiscountTypeFormData>({
    resolver: zodResolver(discountTypeSchema),
    mode: 'onChange',
    defaultValues: {
      key: '',
      name: '',
      description: '',
      requiresAmount: false,
      sortOrder: 0,
    },
  });

  // Update form when discountType changes (for editing)
  useEffect(() => {
    if (discountType) {
      form.reset({
        key: discountType.key,
        name: discountType.name,
        description: discountType.description || '',
        requiresAmount: discountType.requiresAmount,
        sortOrder: discountType.sortOrder,
      });
    } else {
      form.reset({
        key: '',
        name: '',
        description: '',
        requiresAmount: false,
        sortOrder: 0,
      });
    }
  }, [discountType, form]);

  const handleSubmit = (data: DiscountTypeFormData) => {
    onSubmit(data);
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
                  disabled={isSubmitting}
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
                  placeholder="Enter unique key (e.g., EMPLOYEE_DISCOUNT)"
                  {...field}
                  disabled={isSubmitting || isEditing}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                {isEditing
                  ? 'Key cannot be changed after creation'
                  : 'Uppercase letters, numbers, and underscores only, max 20 characters'}
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
                  disabled={isSubmitting}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[80px]"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Optional description, max 500 characters
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiresAmount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-white font-semibold">
                  Requires Amount
                </FormLabel>
                <FormDescription className="text-white/50">
                  Enable if this discount requires a specific amount to be entered
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-yellow-500"
                />
              </FormControl>
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
                  disabled={isSubmitting}
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

        <FormButtons
          submitText={isEditing ? 'Update Discount Type' : 'Add Discount Type'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default DiscountTypeForm;
