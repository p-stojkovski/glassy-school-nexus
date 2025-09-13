import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  TeachingBreak,
  TeachingBreakFormData,
  teachingBreakFormSchema,
  breakTypeLabels,
  BreakType,
} from '../../../types/academicCalendarTypes';

interface TeachingBreakFormProps {
  teachingBreak?: TeachingBreak | null;
  academicYearId: string;
  onSubmit: (data: TeachingBreakFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TeachingBreakForm: React.FC<TeachingBreakFormProps> = ({
  teachingBreak,
  academicYearId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<TeachingBreakFormData>({
    resolver: zodResolver(teachingBreakFormSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      breakType: 'vacation',
      notes: '',
    },
  });

  // Update form when teaching break changes (for editing)
  useEffect(() => {
    if (teachingBreak) {
      form.reset({
        name: teachingBreak.name,
        startDate: teachingBreak.startDate,
        endDate: teachingBreak.endDate,
        breakType: teachingBreak.breakType,
        notes: teachingBreak.notes || '',
      });
    } else {
      form.reset({
        name: '',
        startDate: '',
        endDate: '',
        breakType: 'vacation',
        notes: '',
      });
    }
  }, [teachingBreak, form]);

  const handleSubmit = async (data: TeachingBreakFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit teaching break form:', error);
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
                Break Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter break name (e.g., Winter Break, Mid-term Break)"
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
          name="breakType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Break Type *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                    <SelectValue placeholder="Select break type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-900/95 border-white/20 text-white">
                  {Object.entries(breakTypeLabels).map(([value, label]) => (
                    <SelectItem 
                      key={value} 
                      value={value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Select the type that best describes this break period
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Notes (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this break period..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/50">
                Optional details about the break (max 500 characters)
              </p>
            </FormItem>
          )}
        />

        <FormButtons
          submitText={teachingBreak ? 'Update Teaching Break' : 'Add Teaching Break'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={!form.formState.isValid}
        />
      </form>
    </Form>
  );
};

export default TeachingBreakForm;

