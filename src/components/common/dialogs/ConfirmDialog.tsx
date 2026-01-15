/**
 * ConfirmDialog - Yes/No confirmation dialog
 * Use for actions requiring user confirmation (delete, disable, etc.)
 */

import { LucideIcon } from 'lucide-react';
import { DialogShell, type DialogSize } from './_internal/DialogShell';
import { DialogHeader } from './_internal/DialogHeader';
import { DialogFooter } from './_internal/DialogFooter';
import { type DialogIntent } from './_internal/dialogIntents';

export interface ConfirmDialogProps {
  /** Controls dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Semantic intent determines button and icon colors */
  intent: DialogIntent;
  /** Dialog size (default: 'sm') */
  size?: Extract<DialogSize, 'sm' | 'md'>;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Dialog title */
  title: string;
  /** Dialog description text */
  description: string;
  /** Confirm button text (default: 'Confirm') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Optional content to display between description and buttons */
  infoContent?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  intent,
  size = 'sm',
  icon,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  infoContent,
}: ConfirmDialogProps) {
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
      {infoContent && <div className="py-4">{infoContent}</div>}
      <DialogFooter
        intent={intent}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </DialogShell>
  );
}
