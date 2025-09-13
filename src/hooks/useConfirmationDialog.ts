import { useState, useCallback } from 'react';

export interface ConfirmationDialogState {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  saveText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showSaveOption?: boolean;
  onConfirm?: () => void;
  onSave?: () => void;
}

export const useConfirmationDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmationDialogState>({
    isOpen: false,
  });

  const showConfirmation = useCallback(
    (options: {
      title?: string;
      description?: string;
      confirmText?: string;
      cancelText?: string;
      saveText?: string;
      variant?: 'danger' | 'warning' | 'info';
      showSaveOption?: boolean;
      onConfirm: () => void;
      onSave?: () => void;
    }) => {
      setDialogState({
        isOpen: true,
        ...options,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm?.();
    closeDialog();
  }, [dialogState.onConfirm, closeDialog]);

  const handleSave = useCallback(() => {
    dialogState.onSave?.();
    closeDialog();
  }, [dialogState.onSave, closeDialog]);

  return {
    dialogState,
    showConfirmation,
    closeDialog,
    handleConfirm,
    handleSave,
  };
};

