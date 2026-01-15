/**
 * EmploymentSettingsSheet - Sidebar for managing employment type and base salary
 * Replaces inline controls on the Salary tab
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import DatePicker from '@/components/common/DatePicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import { setBaseSalary, setSelectedTeacher } from '@/domains/teachers/teachersSlice';
import { updateTeacher, getSalaryCalculations, getEmploymentSettings } from '@/services/teacherApiService';
import { BASE_SALARY_VALIDATION } from '@/types/api/teacherBaseSalary';
import type { Teacher } from '@/domains/teachers/teachersSlice';
import type { EmploymentType, EmploymentSettingsResponse } from '@/types/api/teacher';
import {
  employmentSettingsSchema,
  type EmploymentSettingsFormData,
  getDefaultEffectiveDate,
} from '../schemas/employmentSettingsSchema';

interface EmploymentSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback after successful save
  teacher: Teacher;
  academicYearId: string;
}

const employmentTypeDescriptions: Record<EmploymentType, string> = {
  contract: 'Variable pay only (per-class rates)',
  full_time: 'Base salary + variable pay',
};

/** Represents a month with an approved salary calculation */
interface ApprovedMonth {
  year: number;
  month: number; // 0-indexed (January = 0)
}

/**
 * Check if a date falls within an approved month
 * @param date - The date to check
 * @param approvedMonths - List of months with approved salary calculations
 * @returns true if the date should be disabled (falls in an approved month)
 */
function isDateInApprovedMonth(date: Date, approvedMonths: ApprovedMonth[]): boolean {
  return approvedMonths.some(
    (am) => am.year === date.getFullYear() && am.month === date.getMonth()
  );
}

const EmploymentSettingsSheet: React.FC<EmploymentSettingsSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacher,
  academicYearId,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Redux state
  const settingBaseSalary = useAppSelector((state) => state.teachers.loading.settingBaseSalary);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedMonths, setApprovedMonths] = useState<ApprovedMonth[]>([]);
  const [loadingApprovedMonths, setLoadingApprovedMonths] = useState(false);
  const [approvedMonthsError, setApprovedMonthsError] = useState<string | null>(null);
  const [employmentData, setEmploymentData] = useState<EmploymentSettingsResponse | null>(null);
  const [loadingEmploymentData, setLoadingEmploymentData] = useState(false);

  // Get current employment type from teacher (fallback to teacher prop)
  const currentEmploymentType = employmentData?.employmentType || teacher.employmentType || 'contract';

  // Form setup
  const form = useForm<EmploymentSettingsFormData>({
    resolver: zodResolver(employmentSettingsSchema),
    mode: 'onChange',
    defaultValues: {
      employmentType: 'contract',
      effectiveFrom: getDefaultEffectiveDate(),
      baseNetSalary: undefined,
    },
  });

  // Watch employment type for conditional rendering
  const watchedEmploymentType = form.watch('employmentType');

  // Fetch employment settings data
  const fetchEmploymentData = useCallback(async () => {
    setLoadingEmploymentData(true);
    try {
      const data = await getEmploymentSettings(teacher.id, academicYearId);
      setEmploymentData(data);
    } catch (err) {
      console.error('Failed to fetch employment settings:', err);
      // Graceful degradation: use teacher prop data
      setEmploymentData(null);
    } finally {
      setLoadingEmploymentData(false);
    }
  }, [teacher.id, academicYearId]);

  // Fetch approved salary months
  const fetchApprovedMonths = useCallback(async () => {
    setLoadingApprovedMonths(true);
    setApprovedMonthsError(null);
    try {
      const calculations = await getSalaryCalculations(teacher.id, { status: 'approved' });
      const months: ApprovedMonth[] = calculations.map((calc) => {
        const date = new Date(calc.periodStart);
        return {
          year: date.getFullYear(),
          month: date.getMonth(),
        };
      });
      setApprovedMonths(months);
    } catch (err) {
      console.error('Failed to fetch approved months:', err);
      setApprovedMonthsError('Could not load blocked months');
      // Graceful degradation: allow all dates if fetch fails
      setApprovedMonths([]);
    } finally {
      setLoadingApprovedMonths(false);
    }
  }, [teacher.id]);

  // Fetch data when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchEmploymentData();
      fetchApprovedMonths();
    }
  }, [isOpen, fetchEmploymentData, fetchApprovedMonths]);

  // Reset form when employment data is loaded
  useEffect(() => {
    if (isOpen && employmentData && !loadingEmploymentData) {
      form.reset({
        employmentType: employmentData.employmentType,
        effectiveFrom: employmentData.effectiveFrom || getDefaultEffectiveDate(),
        baseNetSalary: employmentData.baseSalaryAmount ?? undefined,
      });
    }
  }, [isOpen, employmentData, loadingEmploymentData, form]);

  // Create the disabled date matcher for DatePicker
  const disabledDateMatcher = useCallback(
    (date: Date): boolean => {
      return isDateInApprovedMonth(date, approvedMonths);
    },
    [approvedMonths]
  );

  // Handle form submission
  const onSubmit = async (data: EmploymentSettingsFormData) => {
    setIsSubmitting(true);
    try {
      const effectiveDate = data.effectiveFrom; // Already in ISO format from DatePicker
      let employmentTypeChanged = false;
      let baseSalarySet = false;

      // Step 1: Update employment type if changed
      if (data.employmentType !== currentEmploymentType) {
        const updatedTeacher = await updateTeacher(teacher.id, {
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          subjectId: teacher.subjectId,
          notes: teacher.notes,
          employmentType: data.employmentType,
        });
        dispatch(setSelectedTeacher(updatedTeacher));
        employmentTypeChanged = true;
      }

      // Step 2: Set base salary if Full Time and salary provided
      if (data.employmentType === 'full_time' && data.baseNetSalary) {
        await dispatch(
          setBaseSalary({
            teacherId: teacher.id,
            request: {
              baseNetSalary: data.baseNetSalary,
              academicYearId,
              effectiveFrom: effectiveDate,
              changeReason: employmentTypeChanged
                ? `Changed to Full Time employment`
                : 'Base salary update',
            },
          })
        ).unwrap();
        baseSalarySet = true;
      }

      // Show success toast
      if (employmentTypeChanged && baseSalarySet) {
        toast({
          title: 'Employment settings updated',
          description: `Changed to ${data.employmentType === 'full_time' ? 'Full Time' : 'Contract'} with base salary set.`,
        });
      } else if (employmentTypeChanged) {
        toast({
          title: 'Employment type updated',
          description: `Changed to ${data.employmentType === 'full_time' ? 'Full Time' : 'Contract'}.`,
        });
      } else if (baseSalarySet) {
        toast({
          title: 'Base salary updated',
          description: 'The base salary has been saved successfully.',
        });
      }

      // Notify parent of successful save (for data refresh)
      onSuccess?.();

      onClose();
    } catch (err: unknown) {
      // Handle both Error instances and ApiError objects (which have a message property)
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to update employment settings';
      toast({
        title: 'Failed to update settings',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || settingBaseSalary;
  const formDisabled = isLoading || !form.formState.isValid || loadingApprovedMonths || loadingEmploymentData;

  // Adapter for FormSheet's onOpenChange to onClose pattern
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      intent="primary"
      size="md"
      icon={Briefcase}
      title="Employment Settings"
      description={`Manage employment type and base salary for ${teacher.name}.`}
      confirmText={isLoading ? 'Saving...' : 'Save'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      isLoading={isLoading}
      disabled={formDisabled}
      isDirty={form.formState.isDirty}
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Employment Type Selection */}
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
                    disabled={isLoading}
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

          {/* Effective From Date Picker */}
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
                    {loadingApprovedMonths || loadingEmploymentData ? (
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
                        min={employmentData?.joinDate?.split('T')[0] || teacher.joinDate?.split('T')[0]}
                        placeholder="Select effective date"
                        disabled={isLoading}
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

          {/* Base Salary Field - Only shown for Full Time */}
          {watchedEmploymentType === 'full_time' && (
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
                        disabled={isLoading}
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
          )}
        </form>
      </Form>
    </FormSheet>
  );
};

export default EmploymentSettingsSheet;
