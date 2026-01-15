/**
 * FormSheet - Sheet with form content and unsaved changes protection
 * Use for form-based actions that need save/cancel buttons.
 */

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnsavedChangesDialog } from '@/components/common/dialogs';
import { SheetShell, type SheetSize } from './_internal/SheetShell';
import { SheetHeader } from './_internal/SheetHeader';
import { SheetFooter } from './_internal/SheetFooter';
import { type SheetIntent } from './_internal/sheetIntents';

export interface FormSheetProps {
  /** Controls sheet open state */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Semantic intent determines button and icon colors */
  intent: SheetIntent;
  /** Required size variant (sm | md | lg | xl | 2xl) */
  size: SheetSize;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Sheet title */
  title: string;
  /** Optional sheet description */
  description?: string;
  /** Confirm button text (default: 'Save') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Callback when user confirms - typically form.handleSubmit(onSubmit) */
  onConfirm: () => void | Promise<void>;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Disabled state for confirm button */
  disabled?: boolean;
  /** Enables unsaved changes protection when true */
  isDirty?: boolean;
  /** Form content */
  children: React.ReactNode;
}

export function FormSheet({
  open,
  onOpenChange,
  intent,
  size,
  icon,
  title,
  description,
  confirmText = 'Save',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  disabled = false,
  isDirty = false,
  children,
}: FormSheetProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = React.useState(false);

  // Reset warning state when sheet opens
  React.useEffect(() => {
    if (open) {
      setShowUnsavedWarning(false);
    }
  }, [open]);

  const handleConfirm = React.useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
    }
  }, [isDirty, onOpenChange]);

  const handleInterceptClose = React.useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true);
      return false; // Block close
    }
    return true; // Allow close
  }, [isDirty]);

  const handleConfirmDiscard = React.useCallback(() => {
    setShowUnsavedWarning(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <>
      <SheetShell
        open={open}
        onOpenChange={onOpenChange}
        size={size}
        onInterceptClose={handleInterceptClose}
      >
        <div className="flex flex-col h-full">
          <SheetHeader
            intent={intent}
            icon={icon}
            title={title}
            description={description}
            hasUnsavedChanges={isDirty}
          />

          <ScrollArea className="flex-1">
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>

          <SheetFooter
            intent={intent}
            confirmText={confirmText}
            cancelText={cancelText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isLoading}
            disabled={disabled}
          />
        </div>
      </SheetShell>

      {/* Unsaved Changes Warning */}
      <UnsavedChangesDialog
        open={showUnsavedWarning}
        onOpenChange={(open) => !open && setShowUnsavedWarning(false)}
        onDiscard={handleConfirmDiscard}
      />
    </>
  );
}
