/**
 * UnsavedChangesDialog - Warning dialog for unsaved changes
 * Use when user attempts to close/navigate away with unsaved changes.
 *
 * Standard 2-button pattern matching other dialogs:
 * - Keep Editing (Cancel) - stay and continue working
 * - Discard Changes (Confirm) - close and lose changes
 */

import { AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export interface UnsavedChangesDialogProps {
  /** Controls dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when user chooses to discard changes */
  onDiscard: () => void;
  /** Custom description text (optional) */
  description?: string;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  description = 'You have unsaved changes that will be lost if you close this panel.',
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="warning"
      icon={AlertTriangle}
      title="Unsaved Changes"
      description={description}
      confirmText="Discard Changes"
      cancelText="Keep Editing"
      onConfirm={onDiscard}
    />
  );
}
