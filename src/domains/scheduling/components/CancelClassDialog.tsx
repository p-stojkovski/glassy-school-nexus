
import React from 'react';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface CancelClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

const CancelClassDialog: React.FC<CancelClassDialogProps> = ({
  open,
  onOpenChange,
  className,
  cancelReason,
  onCancelReasonChange,
  onConfirm,
}) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Class"
      description={`Are you sure you want to cancel ${className}?`}
      onConfirm={onConfirm}
    />
  );
};

export default CancelClassDialog;
