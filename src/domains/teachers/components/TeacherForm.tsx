import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormButtons from '@/components/common/FormButtons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Teacher } from '../teachersSlice';
import { SubjectDto, TeacherHttpStatus, ProblemDetails } from '@/types/api/teacher';
import { TeacherFormData } from '../hooks/useTeacherManagement';
import { checkTeacherEmailAvailable } from '@/services/teacherApiService';
import { useDebounce } from '@/hooks/useDebounce';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Simplified validation schema - API handles uniqueness checks
const teacherSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-.]+$/,
      'Name can only contain letters, spaces, apostrophes, hyphens, and periods'
    ),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .toLowerCase(),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone === '') return true;
        // Phone validation matching API requirements
        const phoneRegex = /^[\d\s\-().+]+$/;
        return phoneRegex.test(phone) && phone.length <= 20;
      },
      {
        message: 'Phone can only contain digits, spaces, hyphens, parentheses, periods, and plus signs',
      }
    ),
  subjectId: z.string().min(1, 'Subject selection is required'),
  notes: z
    .string()
    .optional()
    .refine(
      (notes) => !notes || notes.length <= 500,
      'Notes must be less than 500 characters'
    ),
});

type FormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  teacher?: Teacher | null;
  subjects: SubjectDto[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  isLoading?: boolean;
  onFormStateChange?: (hasErrors: boolean) => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  subjects,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  onFormStateChange,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(teacherSchema),
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

  // Reset form when teacher prop changes
  useEffect(() => {
    if (teacher) {
      form.reset({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || '',
        subjectId: teacher.subjectId,
        notes: teacher.notes || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        subjectId: '',
        notes: '',
      });
    }
  }, [teacher, form]);

  // Instant email availability check (debounced), standardized with Classroom form UX
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

  const emailValue = form.watch('email');
  const debouncedEmail = useDebounce(emailValue, 300);

  // Enable availability checking when user starts typing/changes value
  useEffect(() => {
    if (emailValue && emailValue !== (teacher?.email || '')) {
      setShouldCheckAvailability(true);
    } else {
      setShouldCheckAvailability(false);
    }
  }, [emailValue, teacher?.email]);

  // Avoid rechecking the same value repeatedly
  const lastCheckedKeyRef = React.useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Reset quick state on any change of debounced value or validation state
    setEmailAvailable(null);
    setEmailCheckError(null);

    const trimmed = (debouncedEmail || '').trim().toLowerCase();

    if (!trimmed) {
      setIsCheckingEmail(false);
      return;
    }

    // If editing and unchanged, treat as available and exit
    if (teacher && trimmed === (teacher.email || '').trim().toLowerCase()) {
      setIsCheckingEmail(false);
      setEmailAvailable(true);
      // Clear duplicate error if present
      const currentErr = form.getFieldState('email').error;
      if (currentErr && /already exists|already in use/i.test(currentErr.message || '')) {
        form.clearErrors('email');
      }
      return;
    }

    if (!shouldCheckAvailability) {
      return;
    }

    // Only run when there are no validation errors for the email field
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

        if (!available) {
          // Do not set a field-level error here; show standardized availability UI and disable submit
        } else {
          const currentErr = form.getFieldState('email').error;
          if (currentErr && /already exists|already in use/i.test(currentErr.message || '')) {
            form.clearErrors('email');
          }
        }
        lastCheckedKeyRef.current = checkKey;
      } catch (err: any) {
        if (!isMounted) return;
        setIsCheckingEmail(false);
        setEmailCheckError(err?.message || 'Failed to check availability');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [debouncedEmail, teacher?.id, teacher?.email, shouldCheckAvailability, form, form.formState.errors.email]);

  // Notify parent of form validation state changes
  useEffect(() => {
    if (onFormStateChange) {
      const hasErrors = Object.keys(form.formState.errors).length > 0;
      onFormStateChange(hasErrors);
    }
  }, [form.formState.errors, onFormStateChange]);

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Parent already shows toast; here we set field-level errors to help the user fix issues
      const apiError = error as any;
      const status: number | undefined = apiError?.status;
      const message: string = apiError?.message || '';

      // Duplicate email -> mark the email field
      if (status === TeacherHttpStatus.CONFLICT && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message: 'A teacher with this email address already exists. Please use a different email.',
        });
        form.setFocus('email');
        return;
      }

      // Map server-side validation errors to fields if available (ASP.NET Core ProblemDetails)
      const details = apiError?.details as ProblemDetails | undefined;
      if (status === TeacherHttpStatus.BAD_REQUEST && details && typeof details.errors === 'object') {
        const fieldMap: Record<string, keyof FormData> = {
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

        let firstField: keyof FormData | null = null;
        for (const [key, msgs] of Object.entries(details.errors)) {
          const direct = fieldMap[key];
          const byCase = fieldMap[key.charAt(0).toUpperCase() + key.slice(1)];
          let field: keyof FormData | undefined = direct || byCase;

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

        if (firstField) form.setFocus(firstField);
        return;
      }

      // Generic validation or bad request containing email
      if (status === TeacherHttpStatus.BAD_REQUEST && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message,
        });
        form.setFocus('email');
        return;
      }

      // Leave the form values intact for any other errors
      console.error('Form submission error:', error);
    }
  };

  // Handle form close
  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Guard and memoized sorted subjects
  const sortedSubjects = React.useMemo(
    () => (Array.isArray(subjects) ? [...subjects].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [subjects]
  );
  const isSubjectsEmpty = sortedSubjects.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <SheetTitle className="text-2xl font-bold text-white">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {' '}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 pr-10"
                        />
                        {/* Availability indicator (standardized with Classroom form) */}
                        {shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (teacher?.email || '') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isCheckingEmail ? (
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" title="Checking availability..." />
                            ) : emailCheckError ? (
                              <XCircle className="w-4 h-4 text-red-400" title={`Error: ${emailCheckError}`} />
                            ) : emailAvailable === true ? (
                              <CheckCircle className="w-4 h-4 text-green-400" title="Email is available" />
                            ) : emailAvailable === false ? (
                              <XCircle className="w-4 h-4 text-red-400" title="Email is already taken" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                    {/* Availability status message (standardized) */}
                    {shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (teacher?.email || '') && !isCheckingEmail && (
                      <div className="text-xs mt-1">
                        {emailCheckError ? (
                          <span className="text-red-300">
                            Error checking availability: {emailCheckError}
                          </span>
                        ) : emailAvailable === true ? (
                          <span className="text-green-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            "{debouncedEmail}" is available
                          </span>
                        ) : emailAvailable === false ? (
                          <span className="text-red-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            "{debouncedEmail}" is already taken
                          </span>
                        ) : null}
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Subject *
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger disabled={isSubjectsEmpty} className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed">
                          <SelectValue placeholder={isSubjectsEmpty ? 'No subjects available' : 'Select subject'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900/95 border-white/20">
                        {isSubjectsEmpty ? (
                          <div className="px-3 py-2 text-white/60 text-sm">No subjects available</div>
                        ) : (
                          sortedSubjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id}
                              className="text-white hover:bg-white/10 focus:bg-white/10"
                            >
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Additional Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes..."
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormButtons
                submitText={teacher ? 'Update Teacher' : 'Add Teacher'}
                isLoading={isLoading}
                onCancel={handleClose}
                disabled={
                  !form.formState.isValid ||
                  isSubjectsEmpty ||
                  (shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (teacher?.email || '') && (
                    isCheckingEmail || emailAvailable === false
                  ))
                }
              />
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TeacherForm;
