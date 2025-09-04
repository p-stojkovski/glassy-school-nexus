import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
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

// Subject form validation schema - matches API requirements
const subjectSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(20, 'Key must be ≤20 characters')
    .regex(/^[a-z_]+$/, 'Key must be lowercase with underscores only'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be ≤50 characters'),
  sortOrder: z
    .number()
    .min(0, 'Sort order must be ≥ 0'),
  isActive: z.boolean().default(true),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  subject?: {
    id: string;
    key: string;
    name: string;
    sortOrder: number;
    isActive?: boolean;
  } | null;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      key: '',
      name: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  // Update form when subject changes (for editing)
  useEffect(() => {
    if (subject) {
      form.reset({
        key: subject.key,
        name: subject.name,
        sortOrder: subject.sortOrder,
        isActive: subject.isActive ?? true,
      });
    } else {
      form.reset({
        key: '',
        name: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [subject, form]);

  const handleSubmit = async (data: SubjectFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit subject form:', error);
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
                Subject Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter subject name (e.g., English)"
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
                Subject Key *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter unique key (e.g., english, mathematics)"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Lowercase letters and underscores only, max 20 characters
              </p>
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
                  Active subjects are available for selection in classes and teacher assignments
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormButtons
          submitText={subject ? 'Update Subject' : 'Add Subject'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default SubjectForm;
