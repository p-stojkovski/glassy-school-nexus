import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { subjectSchema, type SubjectFormData } from '../schemas/subjectSchemas';
import type { Subject } from '@/domains/settings/types/subjectTypes';

interface SubjectFormProps {
  subject: Subject | null;
  onSubmit: (data: SubjectFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = subject !== null;

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    mode: 'onChange',
    defaultValues: {
      key: '',
      name: '',
      sortOrder: 0,
    },
  });

  // Update form when subject changes (for editing)
  useEffect(() => {
    if (subject) {
      form.reset({
        key: subject.key,
        name: subject.name,
        sortOrder: subject.sortOrder,
      });
    } else {
      form.reset({
        key: '',
        name: '',
        sortOrder: 0,
      });
    }
  }, [subject, form]);

  const handleSubmit = (data: SubjectFormData) => {
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
                Subject Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter subject name (e.g., English)"
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
                Subject Key *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter unique key (e.g., ENGLISH, MATHEMATICS)"
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
          submitText={isEditing ? 'Update Subject' : 'Add Subject'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default SubjectForm;
