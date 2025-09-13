import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface StandardToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
  duration?: number;
}

const StandardToast: React.FC<StandardToastProps> = ({
  id,
  variant,
  title,
  description,
  action,
  onClose,
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    default: Info,
  };

  const variantStyles = {
    success: {
      border: 'border-green-400/30',
      background: 'bg-green-500/10',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
    },
    error: {
      border: 'border-red-400/30',
      background: 'bg-red-500/10',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
    },
    warning: {
      border: 'border-yellow-400/30',
      background: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
    },
    info: {
      border: 'border-blue-400/30',
      background: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
    },
    default: {
      border: 'border-white/20',
      background: 'bg-white/10',
      iconColor: 'text-white/70',
      titleColor: 'text-white',
    },
  };

  const style = variantStyles[variant];
  const Icon = icons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className={cn(
        'backdrop-blur-md border rounded-xl p-4 shadow-xl min-w-80',
        'transition-all duration-300 ease-in-out',
        style.border,
        style.background
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn('w-5 h-5', style.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-semibold', style.titleColor)}>
            {title}
          </h4>
          {description && (
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-medium bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 px-3 py-1.5 rounded-md transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-0.5 rounded-sm"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default StandardToast;

