/**
 * GenerateSalaryDialog - Dialog to generate a new salary calculation
 * Phase 7.4 implementation
 * Phase 3.1 refactoring - Extracted logic to custom hooks
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Check } from 'lucide-react';
import { ActionDialog } from '@/components/common/dialogs';
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
import { useAppSelector } from '@/store/hooks';
import { MONTHS } from '@/domains/teachers/_shared/constants';
import { useGenerateSalaryForm } from '../hooks/useGenerateSalaryForm';
import { useMonthAvailability } from '../hooks/useMonthAvailability';

interface GenerateSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const GenerateSalaryDialog: React.FC<GenerateSalaryDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();

  // Get existing salary calculations to determine which months are already generated
  const existingCalculations = useAppSelector(
    (state) => state.teachers.salaryCalculations.items
  );

  // Form state management and submission logic
  const { form, selectedYear, onSubmit, loading, yearOptions } = useGenerateSalaryForm({
    teacherId: teacherId!,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  // Month availability logic
  const {
    generatedMonthsForYear,
    isFutureMonth,
    isAllMonthsGenerated,
  } = useMonthAvailability({
    existingCalculations,
    selectedYear,
    form,
    isOpen: open,
  });

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="md"
      icon={Calendar}
      title="Generate Salary Calculation"
      description="Generate a new salary calculation for a specific month and year."
      confirmText="Generate Salary"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={loading}
      disabled={isAllMonthsGenerated}
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
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
                      <SelectContent className="bg-gray-900 border-white/20">
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white focus:bg-white/10 focus:text-white">
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
                      <SelectContent className="bg-gray-900 border-white/20 max-h-[280px]">
                        {MONTHS.map((month) => {
                          const isGenerated = generatedMonthsForYear.has(month.value);
                          const isFuture = isFutureMonth(selectedYear, month.value);
                          const isDisabled = isGenerated || isFuture;

                          return (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                              disabled={isDisabled}
                              className={`text-white focus:bg-white/10 focus:text-white ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <span className="flex items-center justify-between w-full gap-2">
                                <span>{month.label}</span>
                                {isGenerated && (
                                  <span className="flex items-center gap-1 text-xs text-green-400">
                                    <Check className="w-3 h-3" />
                                    Generated
                                  </span>
                                )}
                                {!isGenerated && isFuture && (
                                  <span className="text-xs text-gray-400">Future</span>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Informational note about disabled months */}
          {generatedMonthsForYear.size > 0 && (
            <p className="text-xs text-white/50 mt-2">
              * Months marked with <Check className="w-3 h-3 inline text-green-400" /> already have salary calculations and cannot be selected.
            </p>
          )}

          {/* Warning if all available months for selected year are generated */}
          {isAllMonthsGenerated && (
            <p className="text-xs text-yellow-400 mt-2">
              All available months for {selectedYear} already have salary calculations.
            </p>
          )}
        </div>
      </Form>
    </ActionDialog>
  );
};
