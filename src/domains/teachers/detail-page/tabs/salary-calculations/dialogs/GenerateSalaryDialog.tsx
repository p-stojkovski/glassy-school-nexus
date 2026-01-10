/**
 * GenerateSalaryDialog - Dialog to generate a new salary calculation
 * Phase 7.4 implementation
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  addSalaryCalculation,
} from '@/domains/teachers/teachersSlice';
import { generateSalaryCalculation } from '@/services/teacherApiService';
import {
  generateSalarySchema,
  type GenerateSalaryFormData,
} from '../schemas/salaryDialogSchemas';

interface GenerateSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const GenerateSalaryDialog: React.FC<GenerateSalaryDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.generatingSalaryCalculation
  );

  // Default to current month/year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  // Generate year options (current year and previous year)
  const yearOptions = [currentYear, currentYear - 1];

  const form = useForm<GenerateSalaryFormData>({
    resolver: zodResolver(generateSalarySchema),
    defaultValues: {
      year: currentYear,
      month: currentMonth,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        year: currentYear,
        month: currentMonth,
      });
    }
  }, [open, form, currentYear, currentMonth]);

  const onSubmit = async (data: GenerateSalaryFormData) => {
    if (!teacherId) return;

    try {
      dispatch(
        setLoadingState({ operation: 'generatingSalaryCalculation', loading: true })
      );
      dispatch(
        setError({ operation: 'generateSalaryCalculation', error: null })
      );

      // Calculate period start and end dates
      const periodStart = new Date(data.year, data.month - 1, 1);
      const periodEnd = new Date(data.year, data.month, 0); // Last day of month

      const request = {
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
      };

      const result = await generateSalaryCalculation(teacherId, request);

      // Add to Redux state
      dispatch(addSalaryCalculation(result.calculation));

      const monthName = MONTHS.find(m => m.value === data.month)?.label || '';

      toast({
        title: 'Salary calculation generated',
        description: `Successfully generated calculation for ${monthName} ${data.year}`,
        variant: 'default',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to generate salary calculation';
      dispatch(
        setError({ operation: 'generateSalaryCalculation', error: errorMessage })
      );
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'generatingSalaryCalculation', loading: false })
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1f2e] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-blue-400" />
            Generate Salary Calculation
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Generate a new salary calculation for a specific month and year.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Year</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Month</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Generating...' : 'Generate Salary'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
