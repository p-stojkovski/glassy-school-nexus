import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon for the button */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export interface EmptyStateProps {
  /** Icon to display (Lucide icon component) */
  icon: LucideIcon;
  /** Main title text */
  title: string;
  /** Description text (can be multiline) */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Additional CSS classes for the container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the glass-style background */
  glassBackground?: boolean;
}

const sizeConfig = {
  sm: {
    container: 'p-4',
    iconWrapper: 'w-12 h-12',
    icon: 'w-6 h-6',
    title: 'text-base',
    description: 'text-sm',
    spacing: 'mb-2',
    buttonSpacing: 'mb-3',
  },
  md: {
    container: 'p-6',
    iconWrapper: 'w-16 h-16',
    icon: 'w-8 h-8',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'mb-2',
    buttonSpacing: 'mb-4',
  },
  lg: {
    container: 'p-8',
    iconWrapper: 'w-20 h-20',
    icon: 'w-10 h-10',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'mb-3',
    buttonSpacing: 'mb-6',
  },
};

/**
 * EmptyState - A reusable component for displaying empty states.
 *
 * Features:
 * - Configurable icon, title, and description
 * - Optional primary and secondary action buttons
 * - Multiple size variants (sm, md, lg)
 * - Glass-style background option for dark themes
 *
 * @example
 * // Basic usage
 * <EmptyState
 *   icon={Users}
 *   title="No Students Enrolled"
 *   description="There are no students enrolled in this class yet."
 *   action={{ label: "Add Students", onClick: handleAdd }}
 * />
 *
 * @example
 * // Compact variant
 * <EmptyState
 *   icon={Search}
 *   title="No results found"
 *   description="Try a different search term."
 *   size="sm"
 *   action={{ label: "Clear search", onClick: handleClear }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  glassBackground = true,
}) => {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'border border-white/10 rounded-lg',
        config.container,
        glassBackground && 'bg-white/[0.02]',
        className
      )}
    >
      <div className="flex flex-col items-center text-center py-4">
        {/* Icon */}
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-white/10',
            config.iconWrapper,
            config.buttonSpacing
          )}
        >
          <Icon className={cn('text-white/40', config.icon)} />
        </div>

        {/* Title */}
        <h3 className={cn('font-semibold text-white', config.title, config.spacing)}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={cn('text-white/70', config.description, config.buttonSpacing)}>
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Button
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                size="default"
                variant="outline"
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
              >
                {action.loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled || secondaryAction.loading}
                size="default"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
              >
                {secondaryAction.icon}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
