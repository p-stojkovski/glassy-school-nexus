import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { StudentFormData } from '@/types/api/student';
import DiscountTypesDropdown from '@/components/common/DiscountTypesDropdown';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';

interface FinancialInformationTabProps {
  form: UseFormReturn<StudentFormData>;
}

const FinancialInformationTab: React.FC<FinancialInformationTabProps> = ({
  form,
}) => {
  const { discountTypes } = useDiscountTypes();
  // Watch discount checkbox and type to conditionally show/disable fields
  const hasDiscount = form.watch('hasDiscount');
  const selectedDiscountTypeId = form.watch('discountTypeId');

  // Find the selected discount type to determine if amount is required
  const selectedDiscountType = discountTypes.find(dt => dt.id.toString() === selectedDiscountTypeId);
  const isAmountDisabled = selectedDiscountType && !selectedDiscountType.requiresAmount;
  const isAmountRequired = !!(hasDiscount && selectedDiscountType?.requiresAmount);

  const amount = form.watch('discountAmount');
  useEffect(() => {
    if (isAmountRequired) {
      if (!amount || amount <= 0) {
        form.setError('discountAmount', {
          type: 'manual',
          message: 'Discount amount is required for this discount type.',
        });
      } else {
        const err = form.getFieldState('discountAmount').error;
        if (err && err.type === 'manual') form.clearErrors('discountAmount');
      }
    } else {
      form.clearErrors('discountAmount');
    }
  }, [isAmountRequired, amount, form]);

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
                    form.setValue('discountTypeId', '');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  Discount Type *
                </FormLabel>
                <FormControl>
                  <DiscountTypesDropdown
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset discount amount when changing to a type that doesn't require amount
                      const discountType = discountTypes.find(dt => dt.id.toString() === value);
                      if (discountType && !discountType.requiresAmount) {
                        form.setValue('discountAmount', 0);
                      }
                    }}
                    placeholder="Select discount type"
                    className="focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">
                  Discount Amount {isAmountRequired && <span>*</span>} (MKD)
                  {isAmountDisabled && (
                    <span className="text-white/60 text-sm ml-2">
                      (Not required for this discount type)
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
                      isAmountDisabled ? '0' : 'Enter discount amount in MKD'
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
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default FinancialInformationTab;
