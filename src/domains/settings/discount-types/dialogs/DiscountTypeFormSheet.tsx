import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Percent, Trash2, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import type { DiscountType } from '@/domains/settings/types/discountTypeTypes';
import { discountTypeSchema, type DiscountTypeFormData } from '../schemas/discountTypeSchemas';

interface DiscountTypeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountType?: DiscountType | null;
  onSubmit: (data: DiscountTypeFormData) => Promise<void> | void;
  /** Optional delete handler - only shown when editing an existing discount type */
  onDelete?: () => void;
  isLoading?: boolean;
}

export function DiscountTypeFormSheet({
  open,
  onOpenChange,
  discountType,
  onSubmit,
  onDelete,
  isLoading = false,
}: DiscountTypeFormSheetProps) {
  const isUpdate = !!discountType;
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const form = useForm<DiscountTypeFormData>({
    resolver: zodResolver(discountTypeSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      key: discountType?.key || '',
      name: discountType?.name || '',
      description: discountType?.description || '',
      requiresAmount: discountType?.requiresAmount || false,
      sortOrder: discountType?.sortOrder || 0,
    },
  });

  // Reset form when sheet opens with different discount type
  useEffect(() => {
    if (open) {
      form.reset({
        key: discountType?.key || '',
        name: discountType?.name || '',
        description: discountType?.description || '',
        requiresAmount: discountType?.requiresAmount || false,
        sortOrder: discountType?.sortOrder || 0,
      });
    }
  }, [open, discountType, form]);

  const handleSubmit = useCallback(async (data: DiscountTypeFormData) => {
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
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Percent className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold text-white">
                  {discountType ? 'Edit Discount Type' : 'Add New Discount Type'}
                </SheetTitle>
                <SheetDescription className="text-white/60 text-sm">
                  {discountType
                    ? 'Update the discount type information below'
                    : 'Fill in the details to create a new discount type'}
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
                  {/* Discount Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Discount Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Employee Discount"
                            {...field}
                            maxLength={100}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          1-100 characters. The display name for this discount type.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Discount Key Field */}
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Discount Key *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., EMPLOYEE_DISCOUNT"
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

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe when this discount applies..."
                            {...field}
                            maxLength={500}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-white/50">
                          Optional description, max 500 characters.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Requires Amount Switch */}
                  <FormField
                    control={form.control}
                    name="requiresAmount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white/80">Requires Amount</FormLabel>
                          <FormDescription className="text-white/50">
                            Enable if this discount requires a specific amount to be entered
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-yellow-500"
                          />
                        </FormControl>
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
                  {discountType ? 'Update Discount Type' : 'Add Discount Type'}
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
                  Delete Discount Type
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
