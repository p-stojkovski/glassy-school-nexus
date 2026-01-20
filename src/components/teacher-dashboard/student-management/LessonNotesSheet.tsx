import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StickyNote } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FormSheet } from '@/components/common/sheets';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import { toast } from 'sonner';

const notesSchema = z.object({
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
});

type NotesFormData = z.infer<typeof notesSchema>;

interface LessonNotesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  initialNotes: string;
  onSuccess: () => void;
  disabled?: boolean;
}

export function LessonNotesSheet({
  open,
  onOpenChange,
  lessonId,
  initialNotes,
  onSuccess,
  disabled = false,
}: LessonNotesSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: initialNotes || '',
    },
  });

  // Reset form when sheet opens with new data
  useEffect(() => {
    if (open) {
      form.reset({
        notes: initialNotes || '',
      });
    }
  }, [open, initialNotes, form]);

  const handleSubmit = async (data: NotesFormData) => {
    setIsSubmitting(true);

    try {
      await lessonStudentApiService.updateLessonNotes(lessonId, {
        notes: data.notes?.trim() || '',
      });

      toast.success('Lesson notes saved');
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save notes';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="md"
      icon={StickyNote}
      title="Lesson Notes"
      description="Add observations, reminders, or notes about this lesson"
      confirmText={isSubmitting ? 'Saving...' : 'Save Notes'}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
      disabled={disabled}
      isDirty={form.formState.isDirty}
    >
      <Form {...form}>
        <form id="lesson-notes-form" className="space-y-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder="Add lesson notes, observations, or reminders..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[300px] resize-none"
                    autoFocus
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-white/40 text-right">
                  {(field.value || '').length} / 2000 characters
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormSheet>
  );
}
