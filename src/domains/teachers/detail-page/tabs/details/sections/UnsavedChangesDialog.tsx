import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * Props for UnsavedChangesDialog
 */
interface UnsavedChangesDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** The name of the section that has unsaved changes */
  sectionName: string;
  /** Callback when user chooses to save changes */
  onSave: () => void;
  /** Callback when user chooses to discard changes */
  onDiscard: () => void;
  /** Callback when user cancels (stays in current section) */
  onCancel: () => void;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
}

/**
 * UnsavedChangesDialog - Modal for handling unsaved changes when switching sections
 *
 * Provides three options:
 * - Save: Save current changes before switching to new section
 * - Discard: Discard changes and switch to new section
 * - Cancel: Stay in current section without switching
 *
 * @example
 * ```tsx
 * <UnsavedChangesDialog
 *   open={showPrompt}
 *   sectionName="Teacher Information"
 *   onSave={handlePromptSave}
 *   onDiscard={handlePromptDiscard}
 *   onCancel={handlePromptCancel}
 * />
 * ```
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  sectionName,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="bg-slate-900/95 border-white/20 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            You have unsaved changes in <span className="font-semibold text-white">{sectionName}</span>.
            What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isSaving}
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
          >
            Stay & Continue Editing
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={isSaving}
            className="border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            Discard Changes
          </Button>
          <AlertDialogAction
            onClick={onSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;
