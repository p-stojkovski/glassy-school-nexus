import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Trash2, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import type { Subject } from '@/domains/settings/types/subjectTypes';
import { subjectSchema, type SubjectFormData } from '../schemas/subjectSchemas';

interface SubjectFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSubmit: (data: SubjectFormData) => Promise<void> | void;
  /** Optional delete handler - only shown when editing an existing subject */
  onDelete?: () => void;
  isLoading?: boolean;
}

export function SubjectFormSheet({
  open,
  onOpenChange,
  subject,
  onSubmit,
  onDelete,
  isLoading = false,
}: SubjectFormSheetProps) {
  const isUpdate = !!subject;
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      key: subject?.key || '',
      name: subject?.name || '',
      sortOrder: subject?.sortOrder || 0,
    },
  });

  // Reset form when sheet opens with different subject
  useEffect(() => {
    if (open) {
      form.reset({
        key: subject?.key || '',
        name: subject?.name || '',
        sortOrder: subject?.sortOrder || 0,
      });
    }
  }, [open, subject, form]);

  const handleSubmit = useCallback(async (data: SubjectFormData) => {
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

  const isDisabled = !form.formState.isValid;

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
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold text-white">
                  {subject ? 'Edit Subject' : 'Add New Subject'}
                </SheetTitle>
                <SheetDescription className="text-white/60 text-sm">
                  {subject
                    ? 'Update the subject information below'
                    : 'Fill in the details to create a new subject'}
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
                  {/* Subject Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Subject Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., English, Mathematics"
                            {...field}
                            maxLength={100}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          1-100 characters. The display name for this subject.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Subject Key Field */}
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Subject Key *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., ENGLISH, MATHEMATICS"
                            {...field}
                            disabled={isUpdate}
                            maxLength={20}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          {isUpdate
                            ? 'Key cannot be changed after creation.'
                            : 'Uppercase letters, numbers, and underscores only. Max 20 characters.'}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Sort Order Field */}
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Sort Order *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            {...field}
                            maxLength={3}
                            onChange={(e) => {
                              let inputValue = e.target.value;
                              // Allow empty input for editing
                              if (inputValue === '') {
                                field.onChange('');
                                return;
                              }
                              // Keep only digits and limit to 3 characters
                              inputValue = inputValue.replace(/\D/g, '').slice(0, 3);
                              if (inputValue === '') {
                                field.onChange('');
                                return;
                              }
                              const numericValue = parseInt(inputValue, 10);
                              if (!isNaN(numericValue)) {
                                field.onChange(numericValue);
                              }
                            }}
                            inputMode="numeric"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          Lower numbers appear first in lists.
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
            <div className="flex flex-col gap-3 w-full">
              {/* Primary action buttons */}
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isLoading || isDisabled}
                  className="flex-1 font-semibold bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {subject ? 'Update Subject' : 'Add Subject'}
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

              {/* Delete button - only shown when editing */}
              {isUpdate && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDelete}
                  disabled={isLoading}
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Subject
                </Button>
              )}
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
