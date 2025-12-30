import React, { useEffect, useState, useCallback, useMemo, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign } from 'lucide-react';
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
import { EditableSectionWrapper } from './EditableSectionWrapper';
import { Student } from '@/domains/students/studentsSlice';
import { financialInfoSchema, FinancialInfoFormData } from '@/utils/validation/studentValidators';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';
import DiscountTypesDropdown from '@/components/common/DiscountTypesDropdown';

/**
 * Props for FinancialInfoSection
 */
interface FinancialInfoSectionProps {
  /** The student data to display/edit */
  student: Student;
  /** Whether this section is currently in edit mode */
  isEditing: boolean;
  /** Callback when the Edit button is clicked */
  onEdit: () => void;
  /** Callback when save is requested - receives section data */
  onSave: (data: FinancialInfoFormData) => Promise<boolean>;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when form becomes dirty (has unsaved changes) */
  onFormChange: (isDirty: boolean) => void;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
}

export type FinancialInfoSectionHandle = {
  save: () => Promise<boolean>;
};

/**
 * Extract financial info fields from a student object
 */
const extractFinancialInfo = (student: Student): FinancialInfoFormData => ({
  hasDiscount: student.hasDiscount || false,
  discountTypeId: student.discountTypeId || '',
  discountAmount: student.discountAmount || 0,
});

/**
 * Value display for read-only mode
 */
const ValueDisplay: React.FC<{ label: string; value?: string | null; className?: string }> = ({
  label,
  value,
  className = ''
}) => (
  <div className={className}>
    <p className="text-sm text-white/60 mb-1">{label}</p>
    <p className="text-white">{value || '—'}</p>
  </div>
);

/**
 * FinancialInfoSection - Financial Information section with inline editing
 *
 * Displays/edits: Has Discount, Discount Type, Discount Amount
 */
export const FinancialInfoSection = React.forwardRef<FinancialInfoSectionHandle, FinancialInfoSectionProps>(({
  student,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  isExpanded = true,
  onExpandedChange,
}, ref) => {
  const [isSaving, setIsSaving] = useState(false);
  const { discountTypes } = useDiscountTypes();

  // Form setup
  const form = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    mode: 'onChange',
    defaultValues: extractFinancialInfo(student),
  });

  // Reset form when student changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      form.reset(extractFinancialInfo(student));
    }
  }, [student, isEditing, form]);

  // Track dirty state
  useEffect(() => {
    const subscription = form.watch(() => {
      onFormChange(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Discount amount requirement logic
  const hasDiscount = form.watch('hasDiscount');
  const selectedDiscountTypeId = form.watch('discountTypeId');
  const selectedDiscountType = useMemo(() => {
    return discountTypes.find((dt) => dt.id.toString() === selectedDiscountTypeId);
  }, [discountTypes, selectedDiscountTypeId]);
  const isAmountRequired = !!(hasDiscount && selectedDiscountType?.requiresAmount);
  const isAmountDisabled = selectedDiscountType && !selectedDiscountType.requiresAmount;

  // Get discount type name for display
  const getDiscountTypeName = (discountTypeId?: string): string | null => {
    if (!discountTypeId) return null;
    const discountType = discountTypes.find(dt => dt.id.toString() === discountTypeId);
    return discountType?.name || null;
  };

  // Handle save
  const handleSave = useCallback(async (): Promise<boolean> => {
    const isValid = await form.trigger();
    if (!isValid) return false;

    setIsSaving(true);
    try {
      const success = await onSave(form.getValues());
      if (success) {
        form.reset(form.getValues());
      }
      return success;
    } finally {
      setIsSaving(false);
    }
  }, [form, onSave]);

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }), [handleSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    form.reset(extractFinancialInfo(student));
    onCancel();
  }, [form, student, onCancel]);

  // Check if financial info has any data
  const hasFinancialInfo = student.hasDiscount;

  return (
    <EditableSectionWrapper
      title="Financial Information"
      icon={<DollarSign className="h-5 w-5" />}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isComplete={hasFinancialInfo}
      subtitle="Configure discount settings if applicable"
    >
      {isEditing ? (
        <Form {...form}>
          <div className="space-y-4">
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
                        if (!checked) {
                          form.setValue('discountTypeId', '');
                          form.setValue('discountAmount', 0);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white">Enable Discount</FormLabel>
                    <p className="text-white/60 text-sm">
                      Check this box to enable discount options
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {hasDiscount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discountTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Discount Type *</FormLabel>
                      <FormControl>
                        <DiscountTypesDropdown
                          value={field.value || ''}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const discountType = discountTypes.find(dt => dt.id.toString() === value);
                            if (discountType && !discountType.requiresAmount) {
                              form.setValue('discountAmount', 0);
                            }
                          }}
                          placeholder="Select discount type"
                          className="bg-white/5 border-white/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Discount Amount {isAmountRequired && '*'} (MKD)
                        {isAmountDisabled && (
                          <span className="text-white/60 text-sm ml-2">(Not required)</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="1"
                          placeholder={isAmountDisabled ? '0' : 'Enter discount amount'}
                          disabled={!!isAmountDisabled}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          className={`bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 ${
                            isAmountDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </Form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueDisplay label="Has Discount" value={student.hasDiscount ? 'Yes' : 'No'} />
          {student.hasDiscount && (
            <>
              <ValueDisplay
                label="Discount Type"
                value={getDiscountTypeName(student.discountTypeId) || student.discountTypeName}
              />
              <ValueDisplay
                label="Discount Amount"
                value={student.discountAmount ? `${student.discountAmount} MKD` : '—'}
              />
            </>
          )}
        </div>
      )}
    </EditableSectionWrapper>
  );
});

FinancialInfoSection.displayName = 'FinancialInfoSection';

export default FinancialInfoSection;
