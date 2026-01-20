import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, DollarSign, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { Student } from '@/domains/students/studentsSlice';
import { StudentFormData, StudentHttpStatus, ProblemDetails } from '@/types/api/student';
import { createStudentSchema } from '@/utils/validation/studentValidators';
import StudentInformationTab from './tabs/StudentInformationTab';
import ParentGuardianTab from './tabs/ParentGuardianTab';
import FinancialInformationTab from './tabs/FinancialInformationTab';
import { useEmailAvailability } from '@/domains/students/_shared/hooks';
import { checkStudentEmailAvailable } from '@/services/studentApiService';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';

const studentSchema = createStudentSchema;

interface TabbedStudentFormContentProps {
  student?: Student | null;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
  onFormChange?: (data: StudentFormData) => void;
  hideButtons?: boolean;
}

export interface StudentFormRef {
  submitForm: () => void;
  getFormData: () => StudentFormData;
}

const TabbedStudentFormContent = React.forwardRef<StudentFormRef, TabbedStudentFormContentProps>((
  {
    student,
    onSubmit,
    onCancel,
    onFormChange,
    hideButtons = false,
  },
  ref
) => {
  const [activeTab, setActiveTab] = useState('student-info');
  const { discountTypes } = useDiscountTypes();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      phone: student?.phone || '',
      dateOfBirth: student?.dateOfBirth || '',
      enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
      isActive: student?.isActive ?? true,
      parentContact: student?.parentContact || '',
      parentEmail: student?.parentEmail || '',
      placeOfBirth: student?.placeOfBirth || '',
      notes: student?.notes || '',
      hasDiscount: student?.hasDiscount || false,
      discountTypeId: student?.discountTypeId || '',
      discountAmount: student?.discountAmount || 0,
    },
  });

  const {
    formState: { errors },
  } = form;

  // Email availability checking via shared hook
  const emailValue = form.watch('email');

  const {
    isChecking: isCheckingEmail,
    isAvailable: emailAvailable,
    error: emailCheckError,
    debouncedEmail,
    shouldShowAvailability,
  } = useEmailAvailability({
    emailValue,
    originalEmail: student?.email,
    excludeId: student?.id,
    checkEmailFn: checkStudentEmailAvailable,
  });

  // Clear form email error when availability confirmed
  useEffect(() => {
    if (emailAvailable === true) {
      const currentErr = form.getFieldState('email').error;
      if (currentErr && /already exists|already in use/i.test(currentErr.message || '')) {
        form.clearErrors('email');
      }
    }
  }, [emailAvailable, form]);

  // Watch form values for data indicators
  const watchedValues = form.watch();

  // Track form changes for unsaved changes warning
  useEffect(() => {
    const subscription = form.watch((data) => {
      onFormChange?.(data as StudentFormData);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Determine which tabs have errors for auto-navigation
  const studentTabErrors = useMemo(() => {
    return !!(
      errors.firstName ||
      errors.lastName ||
      errors.email ||
      errors.phone ||
      errors.dateOfBirth ||
      errors.enrollmentDate ||
      errors.placeOfBirth ||
      errors.notes
    );
  }, [errors]);

  const parentTabErrors = useMemo(() => {
    return !!(errors.parentContact || errors.parentEmail);
  }, [errors]);

  const financialTabErrors = useMemo(() => {
    return !!(errors.discountTypeId || errors.discountAmount);
  }, [errors]);

  // Determine which tabs have data for visual indicators
  const studentTabHasData = useMemo(() => {
    return !!(
      watchedValues.firstName ||
      watchedValues.lastName ||
      watchedValues.email ||
      watchedValues.phone ||
      watchedValues.dateOfBirth ||
      watchedValues.enrollmentDate ||
      watchedValues.placeOfBirth ||
      watchedValues.notes
    );
  }, [
    watchedValues.firstName,
    watchedValues.lastName,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.dateOfBirth,
    watchedValues.enrollmentDate,
    watchedValues.placeOfBirth,
    watchedValues.notes,
  ]);

  const parentTabHasData = useMemo(() => {
    return !!(watchedValues.parentContact || watchedValues.parentEmail);
  }, [watchedValues.parentContact, watchedValues.parentEmail]);

  const financialTabHasData = useMemo(() => {
    return !!(watchedValues.discountTypeId || (watchedValues.discountAmount && watchedValues.discountAmount > 0));
  }, [watchedValues.discountTypeId, watchedValues.discountAmount]);

  // Discount amount requirement depending on selected type
  const hasDiscount = form.watch('hasDiscount');
  const selectedDiscountTypeId = form.watch('discountTypeId');
  const discountAmount = form.watch('discountAmount');
  const selectedDiscountType = useMemo(() => {
    return discountTypes.find((dt) => dt.id.toString() === selectedDiscountTypeId);
  }, [discountTypes, selectedDiscountTypeId]);
  const isAmountRequired = !!(hasDiscount && selectedDiscountType?.requiresAmount);

  useEffect(() => {
    if (isAmountRequired) {
      if (!discountAmount || discountAmount <= 0) {
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
  }, [isAmountRequired, discountAmount, form]);

// Auto-navigate to tab with errors on form submission
  const handleSubmit = async (data: StudentFormData) => {
    const isValid = await form.trigger();

    if (!isValid) {
      if (studentTabErrors) {
        setActiveTab('student-info');
      } else if (parentTabErrors) {
        setActiveTab('parent-info');
      } else if (financialTabErrors) {
        setActiveTab('financial-info');
      }
      return;
    }

    // Extra guard: enforce amount required for selected type
    if (isAmountRequired && (!data.discountAmount || data.discountAmount <= 0)) {
      setActiveTab('financial-info');
      form.setError('discountAmount', {
        type: 'manual',
        message: 'Discount amount is required for this discount type.',
      });
      form.setFocus('discountAmount' as any);
      return;
    }

    try {
      await onSubmit(data);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string; details?: ProblemDetails };
      const status = apiError?.status;
      const message = apiError?.message || '';

      if (status === StudentHttpStatus.CONFLICT && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message: 'A student with this email address already exists. Please use a different email.',
        });
        setActiveTab('student-info');
        form.setFocus('email');
        return;
      }

      const details = apiError?.details;
      if (status === StudentHttpStatus.BAD_REQUEST && details && typeof details.errors === 'object') {
        const fieldMap: Record<string, keyof StudentFormData> = {
          FirstName: 'firstName',
          LastName: 'lastName',
          Email: 'email',
          Phone: 'phone',
          DateOfBirth: 'dateOfBirth',
          EnrollmentDate: 'enrollmentDate',
          ParentContact: 'parentContact',
          ParentEmail: 'parentEmail',
          PlaceOfBirth: 'placeOfBirth',
          DiscountTypeId: 'discountTypeId',
          DiscountAmount: 'discountAmount',
          Notes: 'notes',
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          phone: 'phone',
          dateOfBirth: 'dateOfBirth',
          enrollmentDate: 'enrollmentDate',
          parentContact: 'parentContact',
          parentEmail: 'parentEmail',
          placeOfBirth: 'placeOfBirth',
          discountTypeId: 'discountTypeId',
          discountAmount: 'discountAmount',
          notes: 'notes',
        };

        let firstField: keyof StudentFormData | null = null;
        for (const [key, msgs] of Object.entries(details.errors)) {
          const direct = fieldMap[key as keyof typeof fieldMap];
          const byCase = fieldMap[key.charAt(0).toUpperCase() + key.slice(1) as keyof typeof fieldMap];
          let field: keyof StudentFormData | undefined = direct || byCase;

          if (!field) {
            const kl = key.toLowerCase();
            if (kl.includes('email')) field = 'email';
            else if (kl.includes('firstname') || kl.includes('first_name')) field = 'firstName';
            else if (kl.includes('lastname') || kl.includes('last_name')) field = 'lastName';
            else if (kl.includes('phone')) field = 'phone';
            else if (kl.includes('discount')) {
              if (kl.includes('type')) field = 'discountTypeId';
              else if (kl.includes('amount')) field = 'discountAmount';
            }
          }

          if (field) {
            const msgText = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            form.setError(field, { type: 'server', message: msgText });
            if (!firstField) firstField = field;
          }
        }

        if (firstField) {
          const firstIsFinancial = firstField === 'discountTypeId' || firstField === 'discountAmount';
          setActiveTab(firstIsFinancial ? 'financial-info' : (firstField === 'parentContact' || firstField === 'parentEmail') ? 'parent-info' : 'student-info');
          form.setFocus(firstField as any);
        }
        return;
      }

      if (status === StudentHttpStatus.BAD_REQUEST && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message,
        });
        setActiveTab('student-info');
        form.setFocus('email');
        return;
      }

      console.error('Form submission error:', apiError);
    }
  };

  const TabIndicator: React.FC<{ hasErrors: boolean }> = ({ hasErrors }) => (
    hasErrors ? <Circle className="h-2 w-2 fill-red-400 text-red-400 ml-2" /> : null
  );

  // Expose form methods via ref - placed after handleSubmit is defined
  React.useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.handleSubmit(handleSubmit)();
    },
    getFormData: () => {
      return form.getValues();
    },
  }), [form, handleSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-3"
          >
            <TabsList className="bg-white/10 border-white/20 w-full max-w-lg grid grid-cols-3">
              <TabsTrigger
                value="student-info"
                className="data-[state=active]:bg-white/20 text-white justify-center"
              >
                <User className="w-4 h-4 mr-2" />
                Student
                <TabIndicator hasErrors={studentTabErrors} />
              </TabsTrigger>
              <TabsTrigger
                value="parent-info"
                className="data-[state=active]:bg-white/20 text-white justify-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Parent/Guardian
                <TabIndicator hasErrors={parentTabErrors} />
              </TabsTrigger>
              <TabsTrigger
                value="financial-info"
                className="data-[state=active]:bg-white/20 text-white justify-center"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financial
                <TabIndicator hasErrors={financialTabErrors} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student-info">
              <StudentInformationTab
                form={form}
                emailAvailability={{
                  shouldCheckAvailability: shouldShowAvailability,
                  debouncedEmail,
                  isCheckingEmail,
                  emailAvailable,
                  emailCheckError,
                  originalEmail: student?.email || ''
                }}
              />
            </TabsContent>

            <TabsContent value="parent-info">
              <ParentGuardianTab form={form} />
            </TabsContent>

            <TabsContent value="financial-info">
              <FinancialInformationTab form={form} />
            </TabsContent>
          </Tabs>

          {!hideButtons && (
            <div className="pt-2">
              <FormButtons
                submitText={student ? 'Update Student' : 'Add Student'}
                onCancel={onCancel}
                disabled={
                  !form.formState.isValid ||
                  (shouldShowAvailability && (isCheckingEmail || emailAvailable === false)) ||
                  (isAmountRequired && (!discountAmount || discountAmount <= 0))
                }
              />
            </div>
          )}
        </form>
      </Form>
  );
});

export default TabbedStudentFormContent;
