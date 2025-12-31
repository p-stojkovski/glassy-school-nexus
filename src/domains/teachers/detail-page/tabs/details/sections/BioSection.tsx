import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
import {
  teacherBioSchema,
  TeacherBioFormData,
} from '@/utils/validation/teacherValidators';
import { TeacherValidationRules } from '@/types/api/teacher';

/**
 * Props for BioSection
 */
interface BioSectionProps {
  /** The teacher data to display/edit */
  teacher: Teacher;
  /** Whether this section is currently in edit mode */
  isEditing: boolean;
  /** Callback when the Edit button is clicked */
  onEdit: () => void;
  /** Callback when save is requested - receives section data */
  onSave: (data: TeacherBioFormData) => Promise<boolean>;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when form becomes dirty (has unsaved changes) */
  onFormChange: (isDirty: boolean) => void;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onExpandedChange?: (expanded: boolean) => void;
}

export type BioSectionHandle = {
  save: () => Promise<boolean>;
};

/**
 * Extract bio fields from a teacher object
 */
const extractBioData = (teacher: Teacher): TeacherBioFormData => ({
  notes: teacher.notes || '',
});

/**
 * BioSection - Teacher Bio/About section with inline editing
 *
 * Displays/edits: Notes (displayed as "About")
 */
export const BioSection = React.forwardRef<BioSectionHandle, BioSectionProps>(({
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

  // Form setup
  const form = useForm<TeacherBioFormData>({
    resolver: zodResolver(teacherBioSchema),
    mode: 'onChange',
    defaultValues: extractBioData(teacher),
  });

  // Reset form when teacher changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      form.reset(extractBioData(teacher));
    }
  }, [teacher, isEditing, form]);

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
    form.reset(extractBioData(teacher));
    onCancel();
  }, [form, teacher, onCancel]);

  // Check if bio section has content
  const hasBio = !!teacher.notes?.trim();

  // Watch notes for character count
  const notesValue = form.watch('notes');
  const characterCount = (notesValue || '').length;
  const maxLength = TeacherValidationRules.NOTES.MAX_LENGTH;

  return (
    <EditableSectionWrapper
      title="About"
      icon={<FileText className="h-5 w-5" />}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isComplete={hasBio}
      subtitle="Add a brief biography or description"
    >
      {isEditing ? (
        <Form {...form}>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Biography</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter a brief biography, teaching philosophy, or relevant background information..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[120px] resize-none"
                  />
                </FormControl>
                <div className="flex justify-between items-center mt-1">
                  <FormMessage />
                  <span className={`text-xs ${characterCount > maxLength ? 'text-red-400' : 'text-white/50'}`}>
                    {characterCount}/{maxLength}
                  </span>
                </div>
              </FormItem>
            )}
          />
        </Form>
      ) : (
        <div>
          {teacher.notes ? (
            <p className="text-white whitespace-pre-wrap">{teacher.notes}</p>
          ) : (
            <p className="text-white/50 italic">No biography added yet.</p>
          )}
        </div>
      )}
    </EditableSectionWrapper>
  );
});

BioSection.displayName = 'BioSection';

export default BioSection;
