import React from 'react';
import { AlertTriangle, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  saveText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showSaveOption?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  saveText = 'Save & Continue',
  variant = 'warning',
  showSaveOption = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <X className="w-6 h-6 text-red-400" />,
          iconBg: 'bg-red-500/20 border-red-500/30',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: 'bg-amber-500/20 border-amber-500/30',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
          iconBg: 'bg-blue-500/20 border-blue-500/30',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] w-full">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border flex-shrink-0 mt-1',
                styles.iconBg
              )}
            >
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-white mb-1">
                {title}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 pt-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
            className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-xs px-3 whitespace-nowrap"
          >
            {cancelText}
          </Button>
          
          {showSaveOption && onSave && (
            <Button
              onClick={onSave}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 text-xs px-2 whitespace-nowrap"
            >
              <Save className="w-3 h-3 mr-1" />
              Save & Leave
            </Button>
          )}
          
          <Button
            onClick={onConfirm}
            size="sm"
            className={cn('flex-1 border-0 text-xs px-2 whitespace-nowrap', styles.confirmButton)}
          >
            Leave Without Saving
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

