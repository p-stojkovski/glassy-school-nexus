/**
 * DialogFooter - Internal footer component for dialogs
 * Provides consistent button layout with loading states.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter as ShadcnDialogFooter } from '@/components/ui/dialog';
import { intentButtonStyles, type DialogIntent } from './dialogIntents';

interface DialogFooterProps {
  intent: DialogIntent;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showCancelButton?: boolean;
}

export function DialogFooter({
  intent,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
  showCancelButton = true,
}: DialogFooterProps) {
  return (
    <ShadcnDialogFooter>
      {showCancelButton && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isLoading || disabled}
        className={intentButtonStyles[intent]}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {confirmText}
      </Button>
    </ShadcnDialogFooter>
  );
}
