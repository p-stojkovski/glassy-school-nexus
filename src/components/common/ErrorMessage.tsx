import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  /** Use 'soft' for recoverable errors (amber), 'critical' for blocking errors (red) */
  severity?: 'soft' | 'critical';
}

/**
 * Standardized error message component for consistent error display
 * Uses the project's glass morphism design system
 * 
 * Calm design: Uses amber for recoverable errors, red only for critical issues
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  className,
  onRetry,
  retryText = 'Retry',
  showRetry = false,
  severity = 'soft',
}) => {
  if (!message && !title) return null;

  // Calm design: softer amber for recoverable errors, red only for critical
  const colorClasses = severity === 'critical' 
    ? {
        container: 'bg-red-500/10 border-red-400/20',
        title: 'text-red-300',
        message: 'text-red-300/80',
        button: 'bg-red-500/10 border-red-400/20 text-red-300 hover:bg-red-500/20 hover:text-red-200',
      }
    : {
        container: 'bg-amber-500/10 border-amber-400/20',
        title: 'text-amber-300',
        message: 'text-amber-300/80',
        button: 'bg-amber-500/10 border-amber-400/20 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200',
      };

  return (
    <div
      className={cn(
        'rounded-lg p-6 text-center space-y-4 border',
        colorClasses.container,
        className
      )}
    >
      {title && (
        <h3 className={cn('text-xl font-semibold', colorClasses.title)}>{title}</h3>
      )}
      {message && (
        <p className={cn('text-sm', colorClasses.message)}>{message}</p>
      )}
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className={colorClasses.button}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;

