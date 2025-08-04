import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DiscountType } from '@/types/enums';
import { StudentFormData } from '../TabbedStudentFormContent';

interface FinancialInformationTabProps {
  form: UseFormReturn<StudentFormData>;
}

const FinancialInformationTab: React.FC<FinancialInformationTabProps> = ({
  form,
}) => {
  // Watch discount checkbox and type to conditionally show/disable fields
  const hasDiscount = form.watch('hasDiscount');
  const selectedDiscountType = form.watch('discountType');
  const isAmountDisabled = selectedDiscountType === DiscountType.FreeOfCharge;

  return (
    <div className="space-y-6">
      {/* Discount Enable Checkbox */}
      <FormField
        control={form.control}
        name="hasDiscount"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  // Clear discount fields when unchecked
                  if (!checked) {
                    form.setValue('discountType', undefined);
                    form.setValue('discountAmount', 0);
                  }
                }}
                className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-white font-semibold">
                Enable Discount
              </FormLabel>
              <p className="text-white/60 text-sm">
                Check this box to enable discount options for this student
              </p>
            </div>
          </FormItem>
        )}
      />

      {/* Discount Fields - Only show when checkbox is checked */}
      {hasDiscount && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  Discount Type *
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset discount amount when changing type
                    if (value === DiscountType.FreeOfCharge) {
                      form.setValue('discountAmount', 0);
                    }
                  }}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountType.Relatives}>
                      Relatives
                    </SelectItem>
                    <SelectItem value={DiscountType.SocialCase}>
                      Social Case
                    </SelectItem>
                    <SelectItem value={DiscountType.SingleParent}>
                      Single Parent
                    </SelectItem>
                    <SelectItem value={DiscountType.FreeOfCharge}>
                      Free of Charge
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  Discount Amount (Denars)
                  {isAmountDisabled && (
                    <span className="text-white/60 text-sm ml-2">
                      (Disabled for free of charge)
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="1"
                    placeholder={
                      isAmountDisabled ? '0' : 'Enter discount amount in denars'
                    }
                    disabled={isAmountDisabled}
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 ${
                      isAmountDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onChange={(e) => {
                      const value =
                        e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default FinancialInformationTab;
