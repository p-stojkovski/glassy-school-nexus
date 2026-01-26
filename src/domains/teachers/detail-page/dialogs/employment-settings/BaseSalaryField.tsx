/**
 * BaseSalaryField - Numeric input for base net salary
 * Extracted from EmploymentSettingsSheet for better separation of concerns
 *
 * Only visible when employment type is Full Time, as contract workers
 * receive variable pay only (per-class rates).
 */
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BASE_SALARY_VALIDATION } from '@/types/api/teacherBaseSalary';
import type { EmploymentSettingsFormData } from '@/domains/teachers/schemas';

interface BaseSalaryFieldProps {
  form: UseFormReturn<EmploymentSettingsFormData>;
  disabled: boolean;
  visible: boolean;
}

export function BaseSalaryField({ form, disabled, visible }: BaseSalaryFieldProps) {
  if (!visible) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="baseNetSalary"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white text-sm font-medium">
            Base Net Salary <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min={BASE_SALARY_VALIDATION.MIN}
                max={BASE_SALARY_VALIDATION.MAX}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    field.onChange(undefined);
                  } else {
                    const numValue = parseFloat(value);
                    field.onChange(isNaN(numValue) ? undefined : numValue);
                  }
                }}
                disabled={disabled}
                className="bg-white/5 border-white/20 text-white pr-16"
                placeholder="Enter amount"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                MKD
              </span>
            </div>
          </FormControl>
          <FormDescription className="text-white/50 text-xs">
            Range: {BASE_SALARY_VALIDATION.MIN.toLocaleString()} -{' '}
            {BASE_SALARY_VALIDATION.MAX.toLocaleString()} MKD
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
