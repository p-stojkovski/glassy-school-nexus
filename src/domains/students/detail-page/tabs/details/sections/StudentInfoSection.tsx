import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeDateInput } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { personalInfoSchema, PersonalInfoFormData } from '@/utils/validation/studentValidators';
import { useDebounce } from '@/hooks/useDebounce';
import { checkStudentEmailAvailable } from '@/services/studentApiService';

/**
 * Props for StudentInfoSection
 */
interface StudentInfoSectionProps {
  /** The student data to display/edit */
  student: Student;
  /** Whether this section is currently in edit mode */
  isEditing: boolean;
  /** Callback when the Edit button is clicked */
  onEdit: () => void;
  /** Callback when save is requested - receives section data */
  onSave: (data: PersonalInfoFormData) => Promise<boolean>;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when form becomes dirty (has unsaved changes) */
  onFormChange: (isDirty: boolean) => void;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
}

export type StudentInfoSectionHandle = {
  save: () => Promise<boolean>;
};

/**
 * Extract personal info fields from a student object
 */
const extractPersonalInfo = (student: Student): PersonalInfoFormData => ({
  firstName: student.firstName || '',
  lastName: student.lastName || '',
  email: student.email || '',
  phone: student.phone || '',
  dateOfBirth: student.dateOfBirth || '',
  placeOfBirth: student.placeOfBirth || '',
  enrollmentDate: student.enrollmentDate || '',
  isActive: student.isActive ?? true,
  notes: student.notes || '',
});

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth?: string): string | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} years old`;
};

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
 * StudentInfoSection - Student Information section with inline editing
 *
 * Displays/edits: First Name, Last Name, Email, Phone, Date of Birth,
 * Place of Birth, Enrollment Date, Status, Notes
 */
export const StudentInfoSection = React.forwardRef<StudentInfoSectionHandle, StudentInfoSectionProps>(({
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

  // Form setup
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
    defaultValues: extractPersonalInfo(student),
  });

  // Reset form when student changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      form.reset(extractPersonalInfo(student));
    }
  }, [student, isEditing, form]);

  // Track dirty state
  useEffect(() => {
    const subscription = form.watch(() => {
      onFormChange(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Email availability checking
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const emailValue = form.watch('email');
  const debouncedEmail = useDebounce(emailValue, 300);

  useEffect(() => {
    const trimmed = (debouncedEmail || '').trim().toLowerCase();
    if (!trimmed || trimmed === (student.email || '').toLowerCase()) {
      setEmailAvailable(null);
      setIsCheckingEmail(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsCheckingEmail(true);
      try {
        const available = await checkStudentEmailAvailable(trimmed, student.id);
        if (!cancelled) {
          setEmailAvailable(available);
        }
      } catch {
        if (!cancelled) setEmailAvailable(null);
      } finally {
        if (!cancelled) setIsCheckingEmail(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedEmail, student.id, student.email]);

  // Handle save
  const handleSave = useCallback(async (): Promise<boolean> => {
    const isValid = await form.trigger();
    if (!isValid) return false;

    // Check email availability before saving
    if (emailAvailable === false) {
      form.setError('email', { message: 'This email is already in use.' });
      return false;
    }

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
  }, [form, onSave, emailAvailable]);

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }), [handleSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    form.reset(extractPersonalInfo(student));
    onCancel();
  }, [form, student, onCancel]);

  // Check if personal info is complete
  const hasPersonalInfo = !!(student.firstName && student.lastName && student.email);

  return (
    <EditableSectionWrapper
      title="Student Information"
      icon={<User className="h-5 w-5" />}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isComplete={hasPersonalInfo}
      subtitle="Add basic student details for profile completion"
    >
      {isEditing ? (
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">First Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter first name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter last name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 pr-10"
                      />
                      {debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (student.email || '') && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isCheckingEmail ? (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          ) : emailAvailable === true ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : emailAvailable === false ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Status *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollmentDate"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <NativeDateInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Enrollment Date"
                      required
                      placeholder="Select enrollment date"
                      error={fieldState.error?.message}
                      max={new Date().toISOString().split('T')[0]}
                      min={new Date('1900-01-01').toISOString().split('T')[0]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <NativeDateInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Date of Birth"
                      required={false}
                      placeholder="Select date of birth"
                      error={fieldState.error?.message}
                      max={new Date().toISOString().split('T')[0]}
                      min={new Date('1950-01-01').toISOString().split('T')[0]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Place of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter place of birth"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional information"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValueDisplay label="First Name" value={student.firstName} />
          <ValueDisplay label="Last Name" value={student.lastName} />
          <ValueDisplay label="Email" value={student.email} />
          <ValueDisplay label="Phone" value={student.phone} />
          <ValueDisplay
            label="Date of Birth"
            value={student.dateOfBirth ? `${new Date(student.dateOfBirth).toLocaleDateString()} (${calculateAge(student.dateOfBirth)})` : undefined}
          />
          <ValueDisplay label="Place of Birth" value={student.placeOfBirth} />
          <ValueDisplay
            label="Enrollment Date"
            value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : undefined}
          />
          <ValueDisplay label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
          <ValueDisplay label="Notes" value={student.notes} className="md:col-span-2" />
        </div>
      )}
    </EditableSectionWrapper>
  );
});

StudentInfoSection.displayName = 'StudentInfoSection';

export default StudentInfoSection;
