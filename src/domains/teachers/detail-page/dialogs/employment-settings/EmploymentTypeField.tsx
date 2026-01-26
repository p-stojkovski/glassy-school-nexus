/**
 * EmploymentTypeField - Radio group for selecting employment type
 * Extracted from EmploymentSettingsSheet for better separation of concerns
 */
import { UseFormReturn } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { EmploymentSettingsFormData } from '@/domains/teachers/schemas';
import type { EmploymentType } from '@/types/api/teacher';

const employmentTypeDescriptions: Record<EmploymentType, string> = {
  contract: 'Variable pay only (per-class rates)',
  full_time: 'Base salary + variable pay',
};

interface EmploymentTypeFieldProps {
  form: UseFormReturn<EmploymentSettingsFormData>;
  disabled: boolean;
}

export function EmploymentTypeField({ form, disabled }: EmploymentTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="employmentType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-white text-sm font-medium">
            Employment Type
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex gap-3"
              disabled={disabled}
            >
              <div className="flex-1 flex items-start space-x-2 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <RadioGroupItem
                  value="contract"
                  id="contract"
                  className="border-white/40 text-yellow-400 mt-0.5"
                />
                <Label
                  htmlFor="contract"
                  className="flex-1 cursor-pointer font-normal"
                >
                  <span className="text-white font-medium">Contract</span>
                  <p className="text-xs text-white/60 mt-0.5">
                    {employmentTypeDescriptions.contract}
                  </p>
                </Label>
              </div>
              <div className="flex-1 flex items-start space-x-2 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <RadioGroupItem
                  value="full_time"
                  id="full_time"
                  className="border-white/40 text-yellow-400 mt-0.5"
                />
                <Label
                  htmlFor="full_time"
                  className="flex-1 cursor-pointer font-normal"
                >
                  <span className="text-white font-medium">Full Time</span>
                  <p className="text-xs text-white/60 mt-0.5">
                    {employmentTypeDescriptions.full_time}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
