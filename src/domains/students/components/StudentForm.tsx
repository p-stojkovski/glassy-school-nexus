import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/common/DatePicker';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Student } from '../studentsSlice';
import { DiscountTypeDto, StudentHttpStatus, ProblemDetails } from '@/types/api/student';
import { StudentFormData } from '../hooks/useStudentManagement';
import { checkStudentEmailAvailable } from '@/services/studentApiService';
import { useDebounce } from '@/hooks/useDebounce';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Simplified validation schema - API handles uniqueness checks
const studentSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s'-.]+$/,
      'First name can only contain letters, spaces, apostrophes, hyphens, and periods'
    ),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s'-.]+$/,
      'Last name can only contain letters, spaces, apostrophes, hyphens, and periods'
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
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date || date === '') return true;
        const birthDate = new Date(date);
        const today = new Date();
        return birthDate <= today;
      },
      'Date of birth cannot be in the future'
    ),
  enrollmentDate: z
    .string()
    .min(1, 'Enrollment date is required')
    .refine(
      (date) => {
        const enrollDate = new Date(date);
        const today = new Date();
        return enrollDate <= today;
      },
      'Enrollment date cannot be in the future'
    ),
  isActive: z.boolean(),
  parentContact: z.string().optional(),
  parentEmail: z
    .string()
    .optional()
    .refine(
      (email) => {
        if (!email || email === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      'Parent email must be a valid email address'
    ),
  placeOfBirth: z.string().optional(),
  hasDiscount: z.boolean(),
  discountTypeId: z.string().optional(),
  discountAmount: z.number().min(0, 'Discount amount must be positive').default(0),
  notes: z
    .string()
    .optional()
    .refine(
      (notes) => !notes || notes.length <= 500,
      'Notes must be less than 500 characters'
    ),
}).refine(
  (data) => {
    // If discount is enabled, discount type is required
    if (data.hasDiscount && (!data.discountTypeId || data.discountTypeId === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'When discount is enabled, discount type must be selected',
    path: ['discountTypeId'],
  }
);

type FormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  discountTypes: DiscountTypeDto[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isLoading?: boolean;
  onFormStateChange?: (hasErrors: boolean) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  discountTypes,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  onFormStateChange,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      phone: student?.phone || '',
      dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      enrollmentDate: student?.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
      isActive: student?.isActive ?? true,
      parentContact: student?.parentContact || '',
      parentEmail: student?.parentEmail || '',
      placeOfBirth: student?.placeOfBirth || '',
      hasDiscount: student?.hasDiscount ?? false,
      discountTypeId: student?.discountTypeId || '',
      discountAmount: student?.discountAmount || 0,
      notes: student?.notes || '',
    },
  });

  // Reset form when student prop changes
  useEffect(() => {
    if (student) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        isActive: student.isActive,
        parentContact: student.parentContact || '',
        parentEmail: student.parentEmail || '',
        placeOfBirth: student.placeOfBirth || '',
        hasDiscount: student.hasDiscount,
        discountTypeId: student.discountTypeId || '',
        discountAmount: student.discountAmount,
        notes: student.notes || '',
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        isActive: true,
        parentContact: '',
        parentEmail: '',
        placeOfBirth: '',
        hasDiscount: false,
        discountTypeId: '',
        discountAmount: 0,
        notes: '',
      });
    }
  }, [student, form]);

  // Instant email availability check (debounced), standardized with Teachers form UX
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

  const emailValue = form.watch('email');
  const debouncedEmail = useDebounce(emailValue, 300);

  // Enable availability checking when user starts typing/changes value
  useEffect(() => {
    if (emailValue && emailValue !== (student?.email || '')) {
      setShouldCheckAvailability(true);
    } else {
      setShouldCheckAvailability(false);
    }
  }, [emailValue, student?.email]);

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
    if (student && trimmed === (student.email || '').trim().toLowerCase()) {
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

    const checkKey = `${trimmed}-${student?.id || 'new'}`;
    if (lastCheckedKeyRef.current === checkKey) {
      return;
    }

    (async () => {
      try {
        setIsCheckingEmail(true);
        const available = await checkStudentEmailAvailable(trimmed, student?.id);
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
  }, [debouncedEmail, student?.id, student?.email, shouldCheckAvailability, form, form.formState.errors.email]);

  // Notify parent of form validation state changes
  useEffect(() => {
    if (onFormStateChange) {
      const hasErrors = Object.keys(form.formState.errors).length > 0;
      onFormStateChange(hasErrors);
    }
  }, [form.formState.errors, onFormStateChange]);

  // Watch hasDiscount to reset discount fields when disabled
  const hasDiscount = form.watch('hasDiscount');
  useEffect(() => {
    if (!hasDiscount) {
      form.setValue('discountTypeId', '');
      form.setValue('discountAmount', 0);
      form.clearErrors('discountAmount');
    }
  }, [hasDiscount, form]);

  // Enforce discount amount requirement based on selected type (free of charge => not required)
  const selectedDiscountTypeId = form.watch('discountTypeId');
  const discountAmount = form.watch('discountAmount');
  const selectedDiscountType = React.useMemo(() => {
    return sortedDiscountTypes.find((t) => t.id === selectedDiscountTypeId);
  }, [sortedDiscountTypes, selectedDiscountTypeId]);
  const isAmountRequired = !!(form.watch('hasDiscount') && selectedDiscountType?.requiresAmount);

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
      if (status === StudentHttpStatus.CONFLICT && /email/i.test(message)) {
        form.setError('email', {
          type: 'server',
          message: 'A student with this email address already exists. Please use a different email.',
        });
        form.setFocus('email');
        return;
      }

      // Map server-side validation errors to fields if available (ASP.NET Core ProblemDetails)
      const details = apiError?.details as ProblemDetails | undefined;
      if (status === StudentHttpStatus.BAD_REQUEST && details && typeof details.errors === 'object') {
        const fieldMap: Record<string, keyof FormData> = {
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

        let firstField: keyof FormData | null = null;
        for (const [key, msgs] of Object.entries(details.errors)) {
          const direct = fieldMap[key];
          const byCase = fieldMap[key.charAt(0).toUpperCase() + key.slice(1)];
          let field: keyof FormData | undefined = direct || byCase;

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

        if (firstField) form.setFocus(firstField);
        return;
      }

      // Generic validation or bad request containing email
      if (status === StudentHttpStatus.BAD_REQUEST && /email/i.test(message)) {
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

  // Guard and memoized sorted discount types
  const sortedDiscountTypes = React.useMemo(
    () => (Array.isArray(discountTypes) ? [...discountTypes].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [discountTypes]
  );
  const isDiscountTypesEmpty = sortedDiscountTypes.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md improved-form-background border-white/20 text-white overflow-y-auto glass-scrollbar"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <SheetTitle className="text-2xl font-bold text-white">
            {student ? 'Edit Student' : 'Add New Student'}
          </SheetTitle>
        </SheetHeader>

        <div className="student-form-container">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      First Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter first name"
                        {...field}
                        className="glass-input-enhanced"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Last Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        className="glass-input-enhanced"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Email */}
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
                        {/* Availability indicator (standardized with Teachers form) */}
                        {shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (student?.email || '') && (
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
                    {shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (student?.email || '') && !isCheckingEmail && (
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

              {/* Phone */}
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

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value || undefined}
                        onChange={(val) => field.onChange(val ?? '')}
                        placeholder="Select date"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        maxDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Enrollment Date */}
              <FormField
                control={form.control}
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Enrollment Date *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <div className="form-section-divider" />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white font-semibold">
                        Active Student
                      </FormLabel>
                      <p className="text-xs text-white/60">
                        Active students can enroll in classes and courses
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Parent/Guardian Information */}
              <div className="form-section-divider" />
              <FormField
                control={form.control}
                name="parentContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Parent/Guardian Contact
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter parent/guardian contact"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Parent Email */}
              <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Parent/Guardian Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter parent/guardian email"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Place of Birth */}
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">
                      Place of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter place of birth"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              {/* Discount Information */}
              <div className="form-section-divider" />
              <FormField
                control={form.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white font-semibold">
                        Has Discount
                      </FormLabel>
                      <p className="text-xs text-white/60">
                        Student is eligible for tuition discount
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Discount Type */}
              {hasDiscount && (
                <FormField
                  control={form.control}
                  name="discountTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">
                        Discount Type *
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger 
                            disabled={isDiscountTypesEmpty} 
                            className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <SelectValue placeholder={isDiscountTypesEmpty ? 'No discount types available' : 'Select discount type'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-900/95 border-white/20">
                          {isDiscountTypesEmpty ? (
                            <div className="px-3 py-2 text-white/60 text-sm">No discount types available</div>
                          ) : (
                            sortedDiscountTypes.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id}
                                className="text-white hover:bg-white/10 focus:bg-white/10"
                              >
                                {type.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              )}

              {/* Discount Amount */}
              {hasDiscount && (
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">
                        Discount Amount {isAmountRequired && <span>*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter discount amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              )}

              {/* Notes */}
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
                submitText={student ? 'Update Student' : 'Add Student'}
                isLoading={isLoading}
                onCancel={handleClose}
                disabled={
                  !form.formState.isValid ||
                  isDiscountTypesEmpty ||
                  (shouldCheckAvailability && debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (student?.email || '') && (
                    isCheckingEmail || emailAvailable === false
                  )) ||
                  (isAmountRequired && (!discountAmount || discountAmount <= 0))
                }
              />
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentForm;
