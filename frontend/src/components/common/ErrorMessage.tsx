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
}

/**
 * Standardized error message component for consistent error display
 * Uses the project's glass morphism design system
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  className,
  onRetry,
  retryText = 'Retry',
  showRetry = false,
}) => {
  if (!message && !title) return null;

  return (
    <div
      className={cn(
        'bg-red-500/10 border border-red-400/20 rounded-lg p-6 text-center space-y-4',
        className
      )}
    >
      {title && (
        <h3 className="text-xl font-semibold text-red-300">{title}</h3>
      )}
      {message && (
        <p className="text-sm text-red-300/80">{message}</p>
      )}
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="bg-red-500/10 border-red-400/20 text-red-300 hover:bg-red-500/20 hover:text-red-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
