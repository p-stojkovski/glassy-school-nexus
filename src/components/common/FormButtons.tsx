import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormButtonsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  submitIcon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Standardized form buttons component for consistent styling across all sidebar forms
 *
 * @example
 * ```tsx
 * <FormButtons
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   submitText="Add Student"
 *   isLoading={loading}
 * />
 * ```
 */
const FormButtons: React.FC<FormButtonsProps> = ({
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  disabled = false,
  submitIcon,
  className,
  variant = 'default',
}) => {
  const containerClass =
    variant === 'compact'
      ? 'flex gap-3 pt-4'
      : 'flex gap-4 pt-6 border-t border-white/20';

  const submitButtonClass =
    variant === 'compact'
      ? 'flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold'
      : 'flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50';

  const cancelButtonClass =
    variant === 'compact'
      ? 'flex-1 text-white/70 hover:text-white hover:bg-white/10'
      : 'flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200';

  return (
    <div className={cn(containerClass, className)}>
      <Button
        type="submit"
        disabled={isLoading || disabled}
        className={submitButtonClass}
        onClick={onSubmit}
      >
        {isLoading ? (
          'Saving...'
        ) : (
          <>
            {submitIcon && <span className="mr-2">{submitIcon}</span>}
            {submitText}
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className={cancelButtonClass}
      >
        {cancelText}
      </Button>
    </div>
  );
};

export default FormButtons;
