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
} from '../ui/alert-dialog';
import FormButtons from './FormButtons';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'destructive' | 'default';
  customContent?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'destructive',
  customContent,
  isLoading = false,
  disabled = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    // Don't close dialog if loading - let the parent handle it
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {customContent && <div className="py-4">{customContent}</div>}
        <div className="pt-4">
          <FormButtons
            onSubmit={handleConfirm}
            onCancel={() => !isLoading && onOpenChange(false)}
            submitText={confirmText}
            cancelText={cancelText}
            submitVariant={variant === 'destructive' ? 'danger' : 'default'}
            variant="compact"
            isLoading={isLoading}
            disabled={disabled}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;

