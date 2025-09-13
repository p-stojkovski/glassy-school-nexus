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
  PublicHoliday,
  PublicHolidayFormData,
  publicHolidayFormSchema,
} from '../../../types/academicCalendarTypes';

interface PublicHolidayFormProps {
  publicHoliday?: PublicHoliday | null;
  academicYearId: string;
  onSubmit: (data: PublicHolidayFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PublicHolidayForm: React.FC<PublicHolidayFormProps> = ({
  publicHoliday,
  academicYearId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<PublicHolidayFormData>({
    resolver: zodResolver(publicHolidayFormSchema),
    defaultValues: {
      name: '',
      date: '',
      recurringAnnually: false,
    },
  });

  // Update form when public holiday changes (for editing)
  useEffect(() => {
    if (publicHoliday) {
      form.reset({
        name: publicHoliday.name,
        date: publicHoliday.date,
        recurringAnnually: publicHoliday.recurringAnnually,
      });
    } else {
      form.reset({
        name: '',
        date: '',
        recurringAnnually: false,
      });
    }
  }, [publicHoliday, form]);

  const handleSubmit = async (data: PublicHolidayFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit public holiday form:', error);
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
                Holiday Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter holiday name (e.g., Christmas Day, New Year's Day)"
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Date *
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Select the date when this holiday occurs
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurringAnnually"
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
                  Recurring Annually
                </FormLabel>
                <p className="text-xs text-white/50">
                  This holiday occurs on the same date every year. If unchecked, it will only apply to the selected academic year.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-2">Note about Recurring Holidays</h4>
          <p className="text-xs text-white/60">
            Recurring holidays will automatically apply to all future academic years. 
            Non-recurring holidays are specific to the current academic year only.
          </p>
        </div>

        <FormButtons
          submitText={publicHoliday ? 'Update Public Holiday' : 'Add Public Holiday'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default PublicHolidayForm;

