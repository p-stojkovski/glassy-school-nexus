import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import NativeDateInput from '@/components/common/NativeDateInput';
import { setTeacherSalaryConfig } from '@/services/teacherApiService';
import { toast } from 'sonner';

import { salarySetupSchema, SalarySetupFormData, SALARY_SETUP_CONSTANTS } from './salarySetupSchema';
import { useSalaryCalculations } from './useSalaryCalculations';
import SalaryPreviewCards from './SalaryPreviewCards';

interface SalarySetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  academicYearId: string;
  onSuccess: () => void;
}

export default function SalarySetupSheet({
  open,
  onOpenChange,
  teacherId,
  academicYearId,
  onSuccess,
}: SalarySetupSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first day of current month as default
  const getDefaultEffectiveFrom = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const form = useForm<SalarySetupFormData>({
    resolver: zodResolver(salarySetupSchema),
    defaultValues: {
      isDirectGrossEntry: false,
      desiredNetSalary: '',
      grossSalary: '',
      effectiveFrom: new Date(),
      notes: '',
    },
  });

  const isDirectGrossEntry = form.watch('isDirectGrossEntry');
  const desiredNetSalary = form.watch('desiredNetSalary');
  const grossSalary = form.watch('grossSalary');

  // Calculate breakdown based on current input
  const breakdown = useSalaryCalculations({
    inputValue: isDirectGrossEntry ? (grossSalary || '') : (desiredNetSalary || ''),
    isDirectGrossEntry,
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        isDirectGrossEntry: false,
        desiredNetSalary: '',
        grossSalary: '',
        effectiveFrom: new Date(),
        notes: '',
      });
    }
  }, [open, form]);

  // Clear the other field when mode changes
  useEffect(() => {
    if (isDirectGrossEntry) {
      form.setValue('desiredNetSalary', '');
    } else {
      form.setValue('grossSalary', '');
    }
  }, [isDirectGrossEntry, form]);

  const handleSubmit = async (data: SalarySetupFormData) => {
    if (!breakdown) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate gross salary based on mode
      const finalGrossSalary = data.isDirectGrossEntry
        ? parseFloat(data.grossSalary || '0')
        : breakdown.grossSalary;

      // Format date as YYYY-MM-DD
      const effectiveFromStr = data.effectiveFrom instanceof Date
        ? data.effectiveFrom.toISOString().split('T')[0]
        : getDefaultEffectiveFrom();

      await setTeacherSalaryConfig(teacherId, {
        grossSalary: finalGrossSalary,
        academicYearId: academicYearId,
        effectiveFrom: effectiveFromStr,
        notes: data.notes || undefined,
      });

      toast.success('Salary configuration saved successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save salary configuration';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMKD = (amount: number) => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <DollarSign className="w-5 h-5 text-green-400" />
              Set Up Teacher Salary
            </SheetTitle>
            <SheetDescription className="text-white/70 mt-2">
              Configure the monthly gross salary for this teacher. You can enter the desired net amount
              and we'll calculate the required gross, or enter the gross directly.
            </SheetDescription>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Form {...form}>
                <form id="salary-setup-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                  {/* Mode Toggle */}
                  <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-yellow-400" />
                        <div>
                          <Label htmlFor="mode-toggle" className="text-white font-medium">
                            I know the gross amount
                          </Label>
                          <p className="text-xs text-white/60 mt-0.5">
                            {isDirectGrossEntry
                              ? 'Enter gross salary directly'
                              : 'Enter desired net, we calculate gross'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="mode-toggle"
                        checked={isDirectGrossEntry}
                        onCheckedChange={(checked) => form.setValue('isDirectGrossEntry', checked)}
                      />
                    </div>
                  </div>

                  {/* Salary Input - Net Mode */}
                  {!isDirectGrossEntry && (
                    <FormField
                      control={form.control}
                      name="desiredNetSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Desired Net Salary (MKD)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min={SALARY_SETUP_CONSTANTS.MIN_SALARY}
                              placeholder="e.g., 40000"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                            />
                          </FormControl>
                          <FormDescription className="text-white/50">
                            Enter the amount the teacher should take home after all deductions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Salary Input - Gross Mode */}
                  {isDirectGrossEntry && (
                    <FormField
                      control={form.control}
                      name="grossSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Gross Salary (MKD)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min={SALARY_SETUP_CONSTANTS.MIN_SALARY}
                              max={SALARY_SETUP_CONSTANTS.MAX_SALARY}
                              placeholder="e.g., 60000"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                            />
                          </FormControl>
                          <FormDescription className="text-white/50">
                            Enter the total salary amount before any deductions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Live Preview */}
                  <SalaryPreviewCards breakdown={breakdown} />

                  {/* Effective Date */}
                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Effective From</FormLabel>
                        <FormControl>
                          <NativeDateInput
                            value={field.value instanceof Date
                              ? field.value.toISOString().split('T')[0]
                              : getDefaultEffectiveFrom()}
                            onChange={(dateStr) => {
                              const date = new Date(dateStr);
                              field.onChange(date);
                            }}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription className="text-white/50">
                          When this salary configuration takes effect
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any notes about this salary configuration..."
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[80px] resize-none"
                            maxLength={SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH}
                          />
                        </FormControl>
                        <FormDescription className="text-white/50">
                          {field.value?.length || 0}/{SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH} characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg flex gap-3">
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/70">
                      <p className="font-medium text-white/90 mb-1">How salary is calculated</p>
                      <p>
                        Contributions (28%) are deducted from gross salary, then income tax (10%)
                        is applied to the remaining amount. The result is the net salary.
                      </p>
                    </div>
                  </div>

                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <SheetFooter className="p-6 border-t border-white/10">
            <div className="flex gap-3 w-full">
              <Button
                type="submit"
                form="salary-setup-form"
                disabled={isSubmitting || !breakdown}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                {isSubmitting ? 'Saving...' : breakdown ? `Save (${formatMKD(breakdown.grossSalary)} gross)` : 'Save Configuration'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
