import React from 'react';
import { AlertTriangle, Trash2, Check, X, Info } from 'lucide-react';
import FormButtons from './FormButtons';
import { cn } from '@/lib/utils';

interface StandardConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  isLoading?: boolean;
  customContent?: React.ReactNode;
}

const StandardConfirmDialog: React.FC<StandardConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  customContent,
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: Trash2,
      iconStyle: 'text-red-400 bg-red-500/20',
      titleStyle: 'text-red-300',
      submitVariant: 'danger' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconStyle: 'text-yellow-400 bg-yellow-500/20',
      titleStyle: 'text-yellow-300',
      submitVariant: 'warning' as const,
    },
    info: {
      icon: Info,
      iconStyle: 'text-blue-400 bg-blue-500/20',
      titleStyle: 'text-blue-300',
      submitVariant: 'default' as const,
    },
    default: {
      icon: Check,
      iconStyle: 'text-white/70 bg-white/10',
      titleStyle: 'text-white',
      submitVariant: 'default' as const,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl">
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={cn('p-2 rounded-lg', config.iconStyle)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className={cn('text-lg font-semibold', config.titleStyle)}>
              {title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mb-4 leading-relaxed">
            {description}
          </p>

          {/* Custom Content */}
          {customContent && <div className="mb-6">{customContent}</div>}

          {/* Buttons */}
          <FormButtons
            onSubmit={onConfirm}
            onCancel={onClose}
            submitText={confirmText}
            cancelText={cancelText}
            isLoading={isLoading}
            variant="compact"
            submitVariant={config.submitVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default StandardConfirmDialog;

