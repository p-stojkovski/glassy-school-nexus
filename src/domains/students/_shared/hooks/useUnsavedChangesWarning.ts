import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';

export const useUnsavedChangesWarning = (
  hasUnsavedChanges: boolean,
  message: string = 'You have unsaved changes that will be lost if you leave this page.',
  onSave?: () => void
) => {
  const navigate = useNavigate();
  const { dialogState, showConfirmation, closeDialog, handleConfirm, handleSave } =
    useConfirmationDialog();

  // Note: We're not using beforeunload anymore as we have a custom dialog
  // The native browser popup is inconsistent with our design
  // Users can still use Ctrl+S to save or our custom dialog for navigation

  const navigateWithWarning = useCallback(
    (to: string) => {
      if (hasUnsavedChanges) {
        showConfirmation({
          title: 'Unsaved Changes',
          description: message,
          confirmText: 'Leave Without Saving',
          cancelText: 'Stay on Page',
          saveText: 'Save & Leave',
          variant: 'warning',
          showSaveOption: Boolean(onSave),
          onConfirm: () => navigate(to),
          onSave: onSave
            ? async () => {
                try {
                  await onSave();
                  // Navigation will happen automatically after successful save
                } catch (error) {
                  console.error('Save failed:', error);
                }
              }
            : undefined,
        });
      } else {
        navigate(to);
      }
    },
    [hasUnsavedChanges, message, navigate, showConfirmation, onSave]
  );

  return {
    navigateWithWarning,
    dialogState,
    closeDialog,
    handleConfirm,
    handleSave,
  };
};
