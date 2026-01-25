import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Palette } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { UnsavedChangesDialog } from '@/components/common/dialogs';
import type { LessonStatus } from '@/domains/settings/types/lessonStatusTypes';
import { lessonStatusSchema, type LessonStatusFormData } from '../schemas/lessonStatusSchemas';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';

interface LessonStatusFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonStatus: LessonStatus | null;
  onSubmit: (data: LessonStatusFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function LessonStatusFormSheet({
  open,
  onOpenChange,
  lessonStatus,
  onSubmit,
  isLoading = false,
}: LessonStatusFormSheetProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const form = useForm<LessonStatusFormData>({
    resolver: zodResolver(lessonStatusSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      description: lessonStatus?.description || '',
    },
  });

  // Reset form when sheet opens with different lesson status
  useEffect(() => {
    if (open) {
      form.reset({
        description: lessonStatus?.description || '',
      });
    }
  }, [open, lessonStatus, form]);

  const handleSubmit = useCallback(async (data: LessonStatusFormData) => {
    await onSubmit(data);
  }, [onSubmit]);

  // Reset warning state when sheet opens
  useEffect(() => {
    if (open) {
      setShowUnsavedWarning(false);
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    if (form.formState.isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
    }
  }, [form.formState.isDirty, onOpenChange]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedWarning(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Block close if form is dirty
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      setShowUnsavedWarning(true);
      return;
    }
    onOpenChange(newOpen);
  }, [form.formState.isDirty, onOpenChange]);

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className="w-full sm:max-w-[512px] bg-[#1a1f2e]/95 backdrop-blur-xl border-white/10 p-0 flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (form.formState.isDirty) {
              e.preventDefault();
              setShowUnsavedWarning(true);
            }
          }}
        >
          {/* Header */}
          <SheetHeader className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Palette className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold text-white">
                  Edit Lesson Status
                </SheetTitle>
                <SheetDescription className="text-white/60 text-sm">
                  Update the description for this lesson status
                </SheetDescription>
              </div>
            </div>
            {form.formState.isDirty && (
              <div className="flex items-center gap-1.5 mt-3 text-yellow-400 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Unsaved changes
              </div>
            )}
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Form {...form}>
                <form className="space-y-6">
                  {/* Read-only Status Name Display */}
                  <div className="space-y-2">
                    <FormLabel className="text-white/80">Status Name</FormLabel>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-md">
                      {lessonStatus && (
                        <LessonStatusBadge status={lessonStatus.name} size="md" />
                      )}
                    </div>
                    <FormDescription className="text-white/50">
                      Status names are predefined and cannot be changed.
                    </FormDescription>
                  </div>

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a description for this status..."
                            {...field}
                            value={field.value ?? ''}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          Optional description to help users understand when to use this status. Max 500 characters.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer */}
          <SheetFooter className="p-6 border-t border-white/10">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isLoading || !form.formState.isDirty}
                className="flex-1 font-semibold bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Description
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Unsaved Changes Warning */}
      <UnsavedChangesDialog
        open={showUnsavedWarning}
        onOpenChange={(dialogOpen) => !dialogOpen && setShowUnsavedWarning(false)}
        onDiscard={handleConfirmDiscard}
      />
    </>
  );
}
