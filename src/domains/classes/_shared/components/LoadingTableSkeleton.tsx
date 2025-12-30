import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingTableSkeletonProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Height of each skeleton row in pixels */
  rowHeight?: number;
  /** Loading message to display */
  message?: string;
  /** Show the spinner header section */
  showHeader?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * LoadingTableSkeleton - Displays a skeleton loading state for tables.
 *
 * Features:
 * - Configurable number of rows
 * - Optional spinner header with message
 * - Consistent styling with the dark theme
 * - Animated skeleton pulse effect
 *
 * @example
 * // Basic usage
 * <LoadingTableSkeleton rows={5} message="Loading students..." />
 *
 * @example
 * // Compact without header
 * <LoadingTableSkeleton rows={3} showHeader={false} />
 */
export const LoadingTableSkeleton: React.FC<LoadingTableSkeletonProps> = ({
  rows = 5,
  rowHeight = 16,
  message = 'Loading data...',
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with spinner */}
      {showHeader && (
        <div className="flex items-center justify-center space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <div className="text-white/70 text-sm">{message}</div>
          </div>
        </div>
      )}

      {/* Skeleton rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-lg animate-pulse"
            style={{ height: `${rowHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * LoadingSpinnerInline - A simple inline spinner for use in buttons or compact areas.
 */
export const LoadingSpinnerInline: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-white/60',
        sizeClasses[size],
        className
      )}
    />
  );
};

export default LoadingTableSkeleton;
