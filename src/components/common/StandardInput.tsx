import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface StandardInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'search';
}

interface StandardTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Standardized input component with consistent glass morphism styling
 * Ensures all inputs follow the same design system
 */
export const StandardInput = React.forwardRef<
  HTMLInputElement,
  StandardInputProps
>(({ className, label, error, variant = 'default', ...props }, ref) => {
  const baseClasses =
    'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400';
  const searchClasses =
    variant === 'search' ? 'bg-white/5 border-white/10' : '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <Input
        ref={ref}
        className={cn(
          baseClasses,
          searchClasses,
          error ? 'border-red-400' : '',
          className
        )}
        {...props}
      />
      {error && (
        <div className="mt-1 text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
});
StandardInput.displayName = 'StandardInput';

/**
 * Standardized textarea component with consistent glass morphism styling
 */
export const StandardTextarea = React.forwardRef<
  HTMLTextareaElement,
  StandardTextareaProps
>(({ className, label, error, ...props }, ref) => {
  const baseClasses =
    'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px] resize-none';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <Textarea
        ref={ref}
        className={cn(baseClasses, error ? 'border-red-400' : '', className)}
        {...props}
      />
      {error && (
        <div className="mt-1 text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
});
StandardTextarea.displayName = 'StandardTextarea';

