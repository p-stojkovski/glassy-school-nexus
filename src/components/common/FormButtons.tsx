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
  submitVariant?: 'default' | 'danger' | 'warning';
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
  submitVariant = 'default',
}) => {
  const containerClass =
    variant === 'compact'
      ? 'flex gap-3 pt-4'
      : 'flex gap-4 pt-6 border-t border-white/20';

  // Different submit button styles based on variant
  const getSubmitButtonClass = () => {
    const baseCompactClass =
      'flex-1 font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50';
    const baseDefaultClass =
      'flex-1 font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50';

    const baseClass =
      variant === 'compact' ? baseCompactClass : baseDefaultClass;

    switch (submitVariant) {
      case 'danger':
        return `${baseClass} bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30`;
      case 'warning':
        return `${baseClass} bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-500/30`;
      default:
        return variant === 'compact'
          ? `${baseClass} bg-yellow-500 hover:bg-yellow-600 text-black`
          : `${baseClass} bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black`;
    }
  };

  const submitButtonClass = getSubmitButtonClass();

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

