import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

/**
 * Standardized error message component for consistent error display
 * Uses the project's glass morphism design system
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'mt-1 text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded px-2 py-1',
        className
      )}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
