/**
 * EmploymentSettingsSheet - Orchestrator for managing employment type and base salary
 * Uses extracted hook and field components for better maintainability
 */
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import { FormSheet } from '@/components/common/sheets';
import { Form } from '@/components/ui/form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import { setBaseSalary, setSelectedTeacher, selectLoading } from '@/domains/teachers/teachersSlice';
import { updateTeacher } from '@/services/teacherApiService';
import type { Teacher } from '@/domains/teachers/teachersSlice';
import {
  employmentSettingsSchema,
  type EmploymentSettingsFormData,
  getDefaultEffectiveDate,
} from '@/domains/teachers/schemas';
import { useEmploymentSettings } from './useEmploymentSettings';
import { EmploymentTypeField } from './EmploymentTypeField';
import { EffectiveDateField } from './EffectiveDateField';
import { BaseSalaryField } from './BaseSalaryField';

interface EmploymentSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  teacher: Teacher;
  academicYearId: string;
}

export function EmploymentSettingsSheet({
  isOpen,
  onClose,
  onSuccess,
  teacher,
  academicYearId,
}: EmploymentSettingsSheetProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Redux state
  const settingBaseSalary = useAppSelector(selectLoading).settingBaseSalary;

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use extracted hook for data fetching
  const {
    employmentData,
    loadingEmploymentData,
    approvedMonths,
    loadingApprovedMonths,
    approvedMonthsError,
    disabledDateMatcher,
  } = useEmploymentSettings({ teacherId: teacher.id, academicYearId, open: isOpen });

  // Get current employment type (fallback to teacher prop)
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
  const showBaseSalary = watchedEmploymentType === 'full_time';

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

  // Handle form submission
  const onSubmit = async (data: EmploymentSettingsFormData) => {
    setIsSubmitting(true);
    try {
      const effectiveDate = data.effectiveFrom;
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
                ? 'Changed to Full Time employment'
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

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
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

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  // Compute minDate for the effective date field
  const minDate = employmentData?.joinDate?.split('T')[0] || teacher.joinDate?.split('T')[0];

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
          <EmploymentTypeField form={form} disabled={isLoading} />
          <EffectiveDateField
            form={form}
            disabled={isLoading}
            disabledDateMatcher={disabledDateMatcher}
            approvedMonths={approvedMonths}
            loadingApprovedMonths={loadingApprovedMonths}
            loadingEmploymentData={loadingEmploymentData}
            approvedMonthsError={approvedMonthsError}
            minDate={minDate}
          />
          <BaseSalaryField
            form={form}
            disabled={isLoading}
            visible={showBaseSalary}
          />
        </form>
      </Form>
    </FormSheet>
  );
}

export default EmploymentSettingsSheet;
