import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Briefcase, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import { Teacher } from '@/domains/teachers/teachersSlice';
import { TeacherFormData, SubjectDto, TeacherHttpStatus, ProblemDetails } from '@/types/api/teacher';
import { createTeacherSchema } from '@/utils/validation/teacherValidators';
import { PersonalInformationTab, ProfessionalInformationTab } from './tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { checkTeacherEmailAvailable } from '@/services/teacherApiService';

interface TabbedTeacherFormContentProps {
  teacher?: Teacher | null;
  subjects: SubjectDto[];
  onSubmit: (data: TeacherFormData) => void;
  onCancel: () => void;
  onFormChange?: (data: TeacherFormData) => void;
  hideButtons?: boolean;
}

export interface TeacherFormRef {
  submitForm: () => void;
  getFormData: () => TeacherFormData;
}

const TabbedTeacherFormContent = React.forwardRef<TeacherFormRef, TabbedTeacherFormContentProps>((
  {
    teacher,
    subjects,
    onSubmit,
    onCancel,
    onFormChange,
    hideButtons = false,
  },
  ref
) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(createTeacherSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      subjectId: teacher?.subjectId || '',
      notes: teacher?.notes || '',
    },
  });

  const {
    formState: { errors },
  } = form;

  // Email availability checking state
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

  const emailValue = form.watch('email');
  const debouncedEmail = useDebounce(emailValue, 300);

  useEffect(() => {
    if (emailValue && emailValue !== (teacher?.email || '')) {
      setShouldCheckAvailability(true);
    } else {
      setShouldCheckAvailability(false);
    }
  }, [emailValue, teacher?.email]);

  const lastCheckedKeyRef = React.useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setEmailAvailable(null);
    setEmailCheckError(null);

    const trimmed = (debouncedEmail || '').trim().toLowerCase();

    if (!trimmed) {
      setIsCheckingEmail(false);
      return;
    }

    if (teacher && trimmed === (teacher.email || '').trim().toLowerCase()) {
      setIsCheckingEmail(false);
      setEmailAvailable(true);
      const currentErr = form.getFieldState('email').error;
      if (currentErr && /already exists|already in use/i.test(currentErr.message || '')) {
        form.clearErrors('email');
      }
      return;
    }

    if (!shouldCheckAvailability) {
      return;
    }

    const hasLocalError = !!form.getFieldState('email').error;
    if (hasLocalError) {
      setIsCheckingEmail(false);
      return;
    }

    const checkKey = `${trimmed}-${teacher?.id || 'new'}`;
    if (lastCheckedKeyRef.current === checkKey) {
      return;
    }

    (async () => {
      try {
        setIsCheckingEmail(true);
        const available = await checkTeacherEmailAvailable(trimmed, teacher?.id);
        if (!isMounted) return;
        setEmailAvailable(available);
        setIsCheckingEmail(false);
        if (available) {
          const currentErr = form.getFieldState('email').error;
          if (currentErr && /already exists|already in use/i.test(currentErr.message || '')) {
            form.clearErrors('email');
          }
        }
        lastCheckedKeyRef.current = checkKey;
      } catch (err: unknown) {
        if (!isMounted) return;
        setIsCheckingEmail(false);
        setEmailCheckError((err as Error)?.message || 'Failed to check availability');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [debouncedEmail, teacher?.id, teacher?.email, shouldCheckAvailability, form, form.formState.errors.email]);

  // Watch form values for data indicators
  const watchedValues = form.watch();

  // Track form changes for unsaved changes warning
  useEffect(() => {
    const subscription = form.watch((data) => {
      onFormChange?.(data as TeacherFormData);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Determine which tabs have errors for auto-navigation
  const personalTabErrors = useMemo(() => {
    return !!(
      errors.name ||
      errors.email ||
      errors.phone ||
      errors.subjectId
    );
  }, [errors]);

  const professionalTabErrors = useMemo(() => {
    return !!(errors.notes);
  }, [errors]);

  // Determine which tabs have data for visual indicators
  const personalTabHasData = useMemo(() => {
    return !!(
      watchedValues.name ||
      watchedValues.email ||
      watchedValues.phone ||
      watchedValues.subjectId
    );
  }, [
    watchedValues.name,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.subjectId,
  ]);

  const professionalTabHasData = useMemo(() => {
    return !!watchedValues.notes;
  }, [watchedValues.notes]);

  // Guard and check if subjects are empty
  const isSubjectsEmpty = !Array.isArray(subjects) || subjects.length === 0;

  // Auto-navigate to tab with errors on form submission
  const handleSubmit = async (data: TeacherFormData) => {
    const isValid = await form.trigger();

    if (!isValid) {
      if (personalTabErrors) {
        setActiveTab('personal-info');
      } else if (professionalTabErrors) {
        setActiveTab('professional-info');
      }
      return;
    }

    try {
      await onSubmit(data);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string; details?: ProblemDetails };
      const status: number | undefined = apiError?.status;
      const message: string = apiError?.message || '';

      // Duplicate email -> mark the email field
      if (status === TeacherHttpStatus.CONFLICT && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message: 'A teacher with this email address already exists. Please use a different email.',
        });
        setActiveTab('personal-info');
        form.setFocus('email');
        return;
      }

      // Map server-side validation errors to fields if available (ASP.NET Core ProblemDetails)
      const details = apiError?.details;
      if (status === TeacherHttpStatus.BAD_REQUEST && details && typeof details.errors === 'object') {
        const fieldMap: Record<string, keyof TeacherFormData> = {
          Name: 'name',
          Email: 'email',
          Phone: 'phone',
          SubjectId: 'subjectId',
          Notes: 'notes',
          name: 'name',
          email: 'email',
          phone: 'phone',
          subjectId: 'subjectId',
          notes: 'notes',
        };

        let firstField: keyof TeacherFormData | null = null;
        for (const [key, msgs] of Object.entries(details.errors)) {
          const direct = fieldMap[key as keyof typeof fieldMap];
          const byCase = fieldMap[(key.charAt(0).toUpperCase() + key.slice(1)) as keyof typeof fieldMap];
          let field: keyof TeacherFormData | undefined = direct || byCase;

          if (!field) {
            const kl = key.toLowerCase();
            if (kl.includes('email')) field = 'email';
            else if (kl.includes('name')) field = 'name';
            else if (kl.includes('phone')) field = 'phone';
            else if (kl.includes('subject')) field = 'subjectId';
            else if (kl.includes('note')) field = 'notes';
          }

          if (field) {
            const msgText = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            form.setError(field, { type: 'server', message: msgText });
            if (!firstField) firstField = field;
          }
        }

        if (firstField) {
          const firstIsProfessional = firstField === 'notes';
          setActiveTab(firstIsProfessional ? 'professional-info' : 'personal-info');
          form.setFocus(firstField as 'name' | 'email' | 'phone' | 'subjectId' | 'notes');
        }
        return;
      }

      // Generic validation or bad request containing email
      if (status === TeacherHttpStatus.BAD_REQUEST && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message,
        });
        setActiveTab('personal-info');
        form.setFocus('email');
        return;
      }

      console.error('Form submission error:', error);
    }
  };

  const TabIndicator: React.FC<{ hasErrors: boolean }> = ({ hasErrors }) => (
    hasErrors ? <Circle className="h-2 w-2 fill-red-400 text-red-400 ml-2" /> : null
  );

  // Expose form methods via ref
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="bg-white/10 border-white/20 w-full max-w-lg grid grid-cols-2">
            <TabsTrigger
              value="personal-info"
              className="data-[state=active]:bg-white/20 text-white justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Personal
              <TabIndicator hasErrors={personalTabErrors} />
            </TabsTrigger>
            <TabsTrigger
              value="professional-info"
              className="data-[state=active]:bg-white/20 text-white justify-center"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Professional
              <TabIndicator hasErrors={professionalTabErrors} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info">
            <PersonalInformationTab
              form={form}
              subjects={subjects}
              emailAvailability={{
                shouldCheckAvailability,
                debouncedEmail,
                isCheckingEmail,
                emailAvailable,
                emailCheckError,
                originalEmail: teacher?.email || ''
              }}
            />
          </TabsContent>

          <TabsContent value="professional-info">
            <ProfessionalInformationTab form={form} />
          </TabsContent>
        </Tabs>

        {!hideButtons && (
          <div className="pt-2">
            <FormButtons
              submitText={teacher ? 'Update Teacher' : 'Add Teacher'}
              onCancel={onCancel}
              disabled={
                !form.formState.isValid ||
                isSubjectsEmpty ||
                (shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (teacher?.email || '') && (
                  isCheckingEmail || emailAvailable === false
                ))
              }
            />
          </div>
        )}
      </form>
    </Form>
  );
});

TabbedTeacherFormContent.displayName = 'TabbedTeacherFormContent';

export default TabbedTeacherFormContent;
