import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StandardAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  actionText?: string;
}

const StandardAlertDialog: React.FC<StandardAlertDialogProps> = ({
  isOpen,
  onClose,
  variant,
  title,
  description,
  actionText = 'OK',
}) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      iconStyle: 'text-green-400 bg-green-500/20',
      titleStyle: 'text-green-300',
    },
    error: {
      icon: AlertCircle,
      iconStyle: 'text-red-400 bg-red-500/20',
      titleStyle: 'text-red-300',
    },
    warning: {
      icon: AlertTriangle,
      iconStyle: 'text-yellow-400 bg-yellow-500/20',
      titleStyle: 'text-yellow-300',
    },
    info: {
      icon: Info,
      iconStyle: 'text-blue-400 bg-blue-500/20',
      titleStyle: 'text-blue-300',
    },
  };

  const { icon: Icon, iconStyle, titleStyle } = config[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className={cn(
              'mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4',
              iconStyle
            )}
          >
            <Icon className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className={cn('text-lg font-semibold mb-2', titleStyle)}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StandardAlertDialog;
