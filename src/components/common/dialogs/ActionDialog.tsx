/**
 * ActionDialog - Form-based action dialog
 * Use for dialogs containing forms or complex content requiring user input
 */

import { LucideIcon } from 'lucide-react';
import { DialogShell, type DialogSize } from './_internal/DialogShell';
import { DialogHeader } from './_internal/DialogHeader';
import { DialogFooter } from './_internal/DialogFooter';
import { type DialogIntent } from './_internal/dialogIntents';

export interface ActionDialogProps {
  /** Controls dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Semantic intent determines button and icon colors */
  intent: DialogIntent;
  /** Dialog size (default: 'md') */
  size?: DialogSize;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Dialog title */
  title: string;
  /** Optional dialog description text */
  description?: string;
  /** Confirm button text (default: 'Submit') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Callback when user confirms - typically form.handleSubmit(onSubmit) */
  onConfirm: () => void | Promise<void>;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Disabled state for confirm button */
  disabled?: boolean;
  /** REQUIRED - Form content or other interactive elements */
  children: React.ReactNode;
}

export function ActionDialog({
  open,
  onOpenChange,
  intent,
  size = 'md',
  icon,
  title,
  description,
  confirmText = 'Submit',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  disabled = false,
  children,
}: ActionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} size={size}>
      <DialogHeader
        intent={intent}
        icon={icon}
        title={title}
        description={description}
      />
      <div className="py-4">{children}</div>
      <DialogFooter
        intent={intent}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
        disabled={disabled}
      />
    </DialogShell>
  );
}
