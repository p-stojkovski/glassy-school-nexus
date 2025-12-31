import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { Teacher } from '@/domains/teachers/teachersSlice';
import { SubjectDto } from '@/types/api/teacher';
import {
  teacherPersonalInfoSchema,
  TeacherPersonalInfoFormData,
} from '@/utils/validation/teacherValidators';
import { useDebounce } from '@/hooks/useDebounce';
import { checkTeacherEmailAvailable } from '@/services/teacherApiService';
import { useAppSelector } from '@/store/hooks';

/**
 * Props for PersonalInfoSection
 */
interface PersonalInfoSectionProps {
  /** The teacher data to display/edit */
  teacher: Teacher;
  /** Whether this section is currently in edit mode */
  isEditing: boolean;
  /** Callback when the Edit button is clicked */
  onEdit: () => void;
  /** Callback when save is requested - receives section data */
  onSave: (data: TeacherPersonalInfoFormData) => Promise<boolean>;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when form becomes dirty (has unsaved changes) */
  onFormChange: (isDirty: boolean) => void;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
}

export type PersonalInfoSectionHandle = {
  save: () => Promise<boolean>;
};

/**
 * Extract personal info fields from a teacher object
 */
const extractPersonalInfo = (teacher: Teacher): TeacherPersonalInfoFormData => ({
  name: teacher.name || '',
  email: teacher.email || '',
  phone: teacher.phone || '',
  subjectId: teacher.subjectId || '',
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
 * PersonalInfoSection - Teacher Personal Information section with inline editing
 *
 * Displays/edits: Name, Email, Phone, Subject
 * Displays (read-only): Join Date
 */
export const PersonalInfoSection = React.forwardRef<PersonalInfoSectionHandle, PersonalInfoSectionProps>(({
  teacher,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  isExpanded = true,
  onExpandedChange,
}, ref) => {
  const [isSaving, setIsSaving] = useState(false);

  // Get subjects from Redux store
  const subjects = useAppSelector((state) => state.teachers.subjects);

  // Form setup
  const form = useForm<TeacherPersonalInfoFormData>({
    resolver: zodResolver(teacherPersonalInfoSchema),
    mode: 'onChange',
    defaultValues: extractPersonalInfo(teacher),
  });

  // Reset form when teacher changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      form.reset(extractPersonalInfo(teacher));
    }
  }, [teacher, isEditing, form]);

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
    if (!trimmed || trimmed === (teacher.email || '').toLowerCase()) {
      setEmailAvailable(null);
      setIsCheckingEmail(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsCheckingEmail(true);
      try {
        const available = await checkTeacherEmailAvailable(trimmed, teacher.id);
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
  }, [debouncedEmail, teacher.id, teacher.email]);

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
    form.reset(extractPersonalInfo(teacher));
    onCancel();
  }, [form, teacher, onCancel]);

  // Check if personal info is complete
  const hasPersonalInfo = !!(teacher.name && teacher.email && teacher.subjectId);

  // Get subject name for display
  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find((s: SubjectDto) => s.id === subjectId);
    return subject?.name || teacher.subjectName || '—';
  };

  // Format join date for display
  const formatJoinDate = (joinDate: string): string => {
    if (!joinDate) return '—';
    return new Date(joinDate).toLocaleDateString();
  };

  // Sort subjects by sortOrder for dropdown
  const sortedSubjects = [...subjects].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <EditableSectionWrapper
      title="Teacher Information"
      icon={<User className="h-5 w-5" />}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isComplete={hasPersonalInfo}
      subtitle="Add basic teacher details for profile completion"
    >
      {isEditing ? (
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter teacher name"
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
                      {debouncedEmail && debouncedEmail.trim() && debouncedEmail.toLowerCase() !== (teacher.email || '').toLowerCase() && (
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
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Subject *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Join Date - Read-only display in edit mode */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Join Date</p>
              <p className="text-white/70 text-sm py-2">
                {formatJoinDate(teacher.joinDate)} (read-only)
              </p>
            </div>
          </div>
        </Form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValueDisplay label="Full Name" value={teacher.name} />
          <ValueDisplay label="Email Address" value={teacher.email} />
          <ValueDisplay label="Phone Number" value={teacher.phone} />
          <ValueDisplay label="Subject" value={getSubjectName(teacher.subjectId)} />
          <ValueDisplay label="Join Date" value={formatJoinDate(teacher.joinDate)} />
          <ValueDisplay label="Classes Assigned" value={String(teacher.classCount)} />
        </div>
      )}
    </EditableSectionWrapper>
  );
});

PersonalInfoSection.displayName = 'PersonalInfoSection';

export default PersonalInfoSection;
