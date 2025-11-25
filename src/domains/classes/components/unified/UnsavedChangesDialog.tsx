import React from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  tabName: string;
  onDiscard: () => void;
  onStay: () => void;
}

/**
 * Dialog shown when user tries to switch tabs with unsaved changes
 */
const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  tabName,
  onDiscard,
  onStay,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onStay}
      onConfirm={onDiscard}
      title="Unsaved Changes"
      description={`You have unsaved changes in the ${tabName} tab. Your changes will be lost if you leave without saving.`}
      confirmText="Discard Changes"
      cancelText="Stay on Tab"
      variant="danger"
    />
  );
};

export default UnsavedChangesDialog;
