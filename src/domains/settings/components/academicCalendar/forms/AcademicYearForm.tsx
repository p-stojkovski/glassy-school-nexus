import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  AcademicYear,
  AcademicYearFormData,
  academicYearFormSchema,
} from '../../../types/academicCalendarTypes';

interface AcademicYearFormProps {
  academicYear?: AcademicYear | null;
  onSubmit: (data: AcademicYearFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AcademicYearForm: React.FC<AcademicYearFormProps> = ({
  academicYear,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      isActive: false,
    },
  });

  // Update form when academic year changes (for editing)
  useEffect(() => {
    if (academicYear) {
      form.reset({
        name: academicYear.name,
        startDate: academicYear.startDate,
        endDate: academicYear.endDate,
        isActive: academicYear.isActive,
      });
    } else {
      form.reset({
        name: '',
        startDate: '',
        endDate: '',
        isActive: false,
      });
    }
  }, [academicYear, form]);

  const handleSubmit = async (data: AcademicYearFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit academic year form:', error);
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
                Academic Year Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter academic year name (e.g., 2024-2025)"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                A descriptive name for the academic year
              </p>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  Start Date *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  End Date *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>

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
                  Set as Active Academic Year
                </FormLabel>
                <p className="text-xs text-white/50">
                  Only one academic year can be active at a time. Setting this as active will deactivate other years.
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormButtons
          submitText={academicYear ? 'Update Academic Year' : 'Add Academic Year'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default AcademicYearForm;

