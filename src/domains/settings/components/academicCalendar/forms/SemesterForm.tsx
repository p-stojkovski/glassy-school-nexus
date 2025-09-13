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
import {
  Semester,
  SemesterFormData,
  semesterFormSchema,
} from '../../../types/academicCalendarTypes';

interface SemesterFormProps {
  semester?: Semester | null;
  academicYearId: string;
  onSubmit: (data: SemesterFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SemesterForm: React.FC<SemesterFormProps> = ({
  semester,
  academicYearId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => { 
  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: '',
      semesterNumber: 1,
      startDate: '',
      endDate: '',
    },
  });

  // Update form when semester changes (for editing)
  useEffect(() => {
    if (semester) {
      form.reset({
        name: semester.name,
        semesterNumber: semester.semesterNumber,
        startDate: semester.startDate,
        endDate: semester.endDate,
      });
    } else {
      form.reset({
        name: '',
        semesterNumber: 1,
        startDate: '',
        endDate: '',
      });
    }
  }, [semester, form]);

  const handleSubmit = async (data: SemesterFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit semester form:', error);
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
                Semester Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter semester name (e.g., Fall Semester, Spring Semester)"
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
          name="semesterNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Semester Number *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Sequential number for this semester within the academic year
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

        <FormButtons
          submitText={semester ? 'Update Semester' : 'Add Semester'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default SemesterForm;

