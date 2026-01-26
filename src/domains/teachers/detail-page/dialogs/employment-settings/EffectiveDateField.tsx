/**
 * EffectiveDateField - Date picker for selecting effective date with blocked months
 * Extracted from EmploymentSettingsSheet for better separation of concerns
 *
 * Dates in months with approved salary calculations are disabled to prevent
 * retroactive changes to already-approved salary periods.
 */
import { UseFormReturn } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import DatePicker from '@/components/common/DatePicker';
import type { EmploymentSettingsFormData } from '@/domains/teachers/schemas';
import type { ApprovedMonth } from './useEmploymentSettings';

interface EffectiveDateFieldProps {
  form: UseFormReturn<EmploymentSettingsFormData>;
  disabled: boolean;
  disabledDateMatcher: (date: Date) => boolean;
  approvedMonths: ApprovedMonth[];
  loadingApprovedMonths: boolean;
  loadingEmploymentData: boolean;
  approvedMonthsError: string | null;
  minDate?: string;
}

export function EffectiveDateField({
  form,
  disabled,
  disabledDateMatcher,
  approvedMonths,
  loadingApprovedMonths,
  loadingEmploymentData,
  approvedMonthsError,
  minDate,
}: EffectiveDateFieldProps) {
  const isLoading = loadingApprovedMonths || loadingEmploymentData;

  return (
    <FormField
      control={form.control}
      name="effectiveFrom"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-white text-sm font-medium">
            Effective From <span className="text-red-400">*</span>
          </FormLabel>
          <FormControl>
            <div className="relative">
              {isLoading ? (
                <div className="flex items-center gap-2 h-10 px-3 bg-white/5 border border-white/20 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-white/60 text-sm">
                    Loading available dates...
                  </span>
                </div>
              ) : (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  min={minDate}
                  placeholder="Select effective date"
                  disabled={disabled}
                  disabledMatcher={disabledDateMatcher}
                  error={form.formState.errors.effectiveFrom?.message}
                />
              )}
            </div>
          </FormControl>
          {approvedMonthsError && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{approvedMonthsError}</span>
            </div>
          )}
          {approvedMonths.length > 0 && !loadingApprovedMonths && (
            <FormDescription className="text-white/50 text-xs">
              Dates in months with approved salary calculations are disabled.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
