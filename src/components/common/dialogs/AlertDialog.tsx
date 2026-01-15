/**
 * AlertDialog - Single-button notification dialog
 * Use for informational messages that require acknowledgment
 */

import { LucideIcon } from 'lucide-react';
import { DialogShell } from './_internal/DialogShell';
import { DialogHeader } from './_internal/DialogHeader';
import { DialogFooter } from './_internal/DialogFooter';
import { type DialogIntent } from './_internal/dialogIntents';

export interface AlertDialogProps {
  /** Controls dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Semantic intent determines button and icon colors */
  intent: DialogIntent;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Dialog title */
  title: string;
  /** Dialog description text */
  description: string;
  /** Action button text (default: 'OK') */
  actionText?: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  intent,
  icon,
  title,
  description,
  actionText = 'OK',
}: AlertDialogProps) {
  const handleAction = () => {
    onOpenChange(false);
  };

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader
        intent={intent}
        icon={icon}
        title={title}
        description={description}
      />
      <DialogFooter
        intent={intent}
        confirmText={actionText}
        cancelText=""
        onConfirm={handleAction}
        onCancel={() => {}}
        showCancelButton={false}
      />
    </DialogShell>
  );
}
