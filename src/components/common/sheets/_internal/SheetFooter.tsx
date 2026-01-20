/**
 * SheetFooter - Internal footer component for sheets
 * Provides consistent button layout with loading states.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetFooter as ShadcnSheetFooter } from '@/components/ui/sheet';
import { intentButtonStyles, type SheetIntent } from './sheetIntents';

interface SheetFooterProps {
  intent: SheetIntent;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SheetFooter({
  intent,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
}: SheetFooterProps) {
  return (
    <ShadcnSheetFooter className="p-6 border-t border-white/10">
      <div className="flex gap-3 w-full">
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || disabled}
          className={`flex-1 font-semibold ${intentButtonStyles[intent]}`}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {confirmText}
        </Button>
{cancelText && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 text-white hover:bg-white/10"
          >
            {cancelText}
          </Button>
        )}
      </div>
    </ShadcnSheetFooter>
  );
}
