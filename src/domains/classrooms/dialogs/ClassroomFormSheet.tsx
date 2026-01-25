import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
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
import { useDebounce } from '@/hooks/useDebounce';
import { Classroom } from '@/domains/classrooms/classroomsSlice';
import {
  createClassroomSchema,
  updateClassroomSchema,
  CreateClassroomFormData,
} from '@/utils/validation/classroomValidators';
import { ClassroomValidationRules } from '@/types/api/classroom';

interface ClassroomFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: Classroom | null;
  onSubmit: (data: CreateClassroomFormData) => Promise<void> | void;
  /** Optional delete handler - only shown when editing an existing classroom */
  onDelete?: () => void;
  checkNameAvailability?: (name: string, excludeId?: string) => void;
  nameAvailability?: {
    [name: string]: {
      isAvailable: boolean;
      isChecking: boolean;
      error: string | null;
    };
  };
  isLoading?: boolean;
}

export function ClassroomFormSheet({
  open,
  onOpenChange,
  classroom,
  onSubmit,
  onDelete,
  checkNameAvailability,
  nameAvailability = {},
  isLoading = false,
}: ClassroomFormSheetProps) {
  const isUpdate = !!classroom;
  const schema = isUpdate ? updateClassroomSchema : createClassroomSchema;
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const form = useForm<CreateClassroomFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: classroom?.name || '',
      location: classroom?.location || '',
      capacity: classroom?.capacity || ClassroomValidationRules.CAPACITY.DEFAULT,
    },
  });

  // Reset form when sheet opens with different classroom
  useEffect(() => {
    if (open) {
      form.reset({
        name: classroom?.name || '',
        location: classroom?.location || '',
        capacity: classroom?.capacity || ClassroomValidationRules.CAPACITY.DEFAULT,
      });
    }
  }, [open, classroom, form]);

  // Watch the name field for real-time availability checking
  const nameValue = form.watch('name');
  const debouncedName = useDebounce(nameValue, 300);

  // State for tracking if we should check availability
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

  // Hold latest callback in a ref to avoid effect retrigger on identity changes
  const checkNameAvailabilityRef = useRef<typeof checkNameAvailability>();
  useEffect(() => {
    checkNameAvailabilityRef.current = checkNameAvailability;
  }, [checkNameAvailability]);

  // Track last checked key to avoid rechecking the same value
  const lastCheckedKeyRef = useRef<string | null>(null);

  // Effect to check name availability when debounced name changes
  useEffect(() => {
    const trimmed = (debouncedName || '').trim();
    const classroomName = classroom?.name || '';
    const classroomId = classroom?.id;

    // Guards: non-empty, meets min length, not the same as current classroom name, user is typing
    if (!trimmed) return;
    if (trimmed.length < ClassroomValidationRules.NAME.MIN_LENGTH) return;
    if (trimmed === classroomName.trim()) return;
    if (!shouldCheckAvailability) return;

    // Only check availability when there are no validation errors on the name field
    const hasLocalError = !!form.getFieldState('name').error;
    if (hasLocalError) return;

    const checkKey = `${trimmed}-${classroomId || 'new'}`;
    if (lastCheckedKeyRef.current === checkKey) return;

    checkNameAvailabilityRef.current?.(trimmed, classroomId);
    lastCheckedKeyRef.current = checkKey;
  }, [debouncedName, classroom?.name, classroom?.id, shouldCheckAvailability, form]);

  // Enable availability checking when user starts typing
  useEffect(() => {
    if (nameValue && nameValue !== classroom?.name) {
      setShouldCheckAvailability(true);
    } else {
      setShouldCheckAvailability(false);
    }
  }, [nameValue, classroom?.name]);

  // Get availability status for current name
  const trimmedDebouncedName = debouncedName?.trim() || '';
  const currentNameAvailability = nameAvailability[trimmedDebouncedName];
  const hasNameError = !!form.getFieldState('name').error;
  const showAvailabilityIndicator =
    shouldCheckAvailability &&
    !hasNameError &&
    !!debouncedName &&
    !!trimmedDebouncedName &&
    debouncedName !== classroom?.name;

  // Check if name availability blocks submission
  const isNameUnavailable = showAvailabilityIndicator &&
    currentNameAvailability !== undefined &&
    currentNameAvailability.isAvailable === false;
  const isCheckingName = showAvailabilityIndicator && !!currentNameAvailability?.isChecking;

  const handleSubmit = useCallback(async (data: CreateClassroomFormData) => {
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

  const isDisabled = !form.formState.isValid || isNameUnavailable || isCheckingName;

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
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Building2 className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold text-white">
                  {classroom ? 'Edit Classroom' : 'Add New Classroom'}
                </SheetTitle>
                <SheetDescription className="text-white/60 text-sm">
                  {classroom
                    ? 'Update the classroom information below'
                    : 'Fill in the details to create a new classroom'}
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
                  {/* Classroom Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Classroom Name *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="e.g., Room A-101, Lab 205, Conference Room B"
                              {...field}
                              maxLength={ClassroomValidationRules.NAME.MAX_LENGTH}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 pr-10"
                            />
                            {showAvailabilityIndicator && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {currentNameAvailability?.isChecking ? (
                                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" title="Checking availability..." />
                                ) : currentNameAvailability?.error ? (
                                  <XCircle className="w-4 h-4 text-red-400" title={`Error: ${currentNameAvailability.error}`} />
                                ) : currentNameAvailability?.isAvailable ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" title="Name is available" />
                                ) : currentNameAvailability && !currentNameAvailability.isAvailable ? (
                                  <XCircle className="w-4 h-4 text-red-400" title="Name is already taken" />
                                ) : null}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />

                        {/* Availability status message */}
                        {showAvailabilityIndicator && currentNameAvailability && !currentNameAvailability.isChecking && (
                          <div className="text-xs mt-1">
                            {currentNameAvailability.error ? (
                              <span className="text-red-300">
                                Error checking availability: {currentNameAvailability.error}
                              </span>
                            ) : currentNameAvailability.isAvailable ? (
                              <span className="text-green-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                &quot;{debouncedName}&quot; is available
                              </span>
                            ) : (
                              <span className="text-red-300 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                &quot;{debouncedName}&quot; is already taken
                              </span>
                            )}
                          </div>
                        )}

                        <FormDescription className="text-white/50">
                          {ClassroomValidationRules.NAME.MIN_LENGTH}-{ClassroomValidationRules.NAME.MAX_LENGTH} characters. Letters, numbers, spaces, and basic punctuation allowed.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Location Field */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Building A, First Floor, Room #205, North Wing"
                            {...field}
                            maxLength={ClassroomValidationRules.LOCATION.MAX_LENGTH}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          Optional. Max {ClassroomValidationRules.LOCATION.MAX_LENGTH} characters. Can include building names, floor numbers, and directions.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Capacity Field */}
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Capacity *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={ClassroomValidationRules.CAPACITY.DEFAULT.toString()}
                            {...field}
                            maxLength={2}
                            onChange={(e) => {
                              let inputValue = e.target.value;
                              // Allow empty input for editing
                              if (inputValue === '') {
                                field.onChange('');
                                return;
                              }
                              // Keep only digits and limit to 2 characters; strip +, -, and any other non-digits
                              inputValue = inputValue.replace(/\D/g, '').slice(0, 2);
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
                          Maximum number of students. Range: {ClassroomValidationRules.CAPACITY.MIN}-{ClassroomValidationRules.CAPACITY.MAX} students.
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
                  {classroom ? 'Update Classroom' : 'Add Classroom'}
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
                  Delete Classroom
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
