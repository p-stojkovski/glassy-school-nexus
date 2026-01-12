import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { guardianInfoSchema, GuardianInfoFormData } from '@/utils/validation/studentValidators';

/**
 * Props for GuardianInfoSection
 */
interface GuardianInfoSectionProps {
  /** The student data to display/edit */
  student: Student;
  /** Whether this section is currently in edit mode */
  isEditing?: boolean;
  /** Callback when the Edit button is clicked */
  onEdit?: () => void;
  /** Callback when save is requested - receives section data */
  onSave?: (data: GuardianInfoFormData) => Promise<boolean>;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Callback when form becomes dirty (has unsaved changes) */
  onFormChange?: (isDirty: boolean) => void;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
  /** When true, shows read-only display without edit capabilities */
  readOnly?: boolean;
}

export type GuardianInfoSectionHandle = {
  save: () => Promise<boolean>;
};

/**
 * Extract guardian info fields from a student object
 */
const extractGuardianInfo = (student: Student): GuardianInfoFormData => ({
  parentContact: student.parentContact || '',
  parentEmail: student.parentEmail || '',
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
 * GuardianInfoSection - Parent/Guardian Information section with inline editing
 *
 * Displays/edits: Parent Contact, Parent Email
 */
export const GuardianInfoSection = React.forwardRef<GuardianInfoSectionHandle, GuardianInfoSectionProps>(({
  student,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  isExpanded = true,
  onExpandedChange,
  readOnly = false,
}, ref) => {
  const [isSaving, setIsSaving] = useState(false);

  // Form setup
  const form = useForm<GuardianInfoFormData>({
    resolver: zodResolver(guardianInfoSchema),
    mode: 'onChange',
    defaultValues: extractGuardianInfo(student),
  });

  // Reset form when student changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      form.reset(extractGuardianInfo(student));
    }
  }, [student, isEditing, form]);

  // Track dirty state
  useEffect(() => {
    const subscription = form.watch(() => {
      onFormChange(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

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
    form.reset(extractGuardianInfo(student));
    onCancel();
  }, [form, student, onCancel]);

  // Check if guardian info has any data
  const hasGuardianInfo = !!(student.parentContact || student.parentEmail);

  // Determine if we should show edit form (only if not readOnly and isEditing)
  const showEditForm = !readOnly && isEditing;

  return (
    <EditableSectionWrapper
      title="Parent/Guardian Information"
      icon={<Users className="h-5 w-5" />}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isComplete={hasGuardianInfo}
      subtitle="Add parent or guardian contact details"
      readOnly={readOnly}
    >
      {showEditForm ? (
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="parentContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Parent/Guardian Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter parent phone number"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Parent/Guardian Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter parent email address"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
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
          <ValueDisplay label="Parent/Guardian Phone" value={student.parentContact} />
          <ValueDisplay label="Parent/Guardian Email" value={student.parentEmail} />
        </div>
      )}
    </EditableSectionWrapper>
  );
});

GuardianInfoSection.displayName = 'GuardianInfoSection';

export default GuardianInfoSection;
