import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type MetricBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface MetricBadgeProps {
  /** Icon to display (React element) */
  icon: React.ReactNode;
  /** Numeric count to display */
  count: number;
  /** Label for tooltip or inline display */
  label: string;
  /** Visual style variant */
  variant: MetricBadgeVariant;
  /** Show label inline (default: false, shows in tooltip) */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Tooltip delay in milliseconds (default: 300) */
  tooltipDelay?: number;
}

const variantStyles: Record<MetricBadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400/90 border-emerald-400/20',
  warning: 'bg-amber-500/15 text-amber-300/90 border-amber-400/25',
  danger: 'bg-red-500/20 text-red-300/90 border-red-400/40',
  info: 'bg-blue-500/15 text-blue-300/90 border-blue-400/25',
  neutral: 'bg-white/10 text-white/80 border-white/20',
};

/**
 * MetricBadge - A reusable badge for displaying metrics with an icon and count.
 *
 * Features:
 * - Fixed-width design for consistent alignment in tables/grids
 * - Optional inline label or tooltip-based label
 * - Multiple color variants for different contexts
 * - Accessible tooltip with customizable delay
 *
 * @example
 * // Compact badge with tooltip
 * <MetricBadge icon={<CheckCircle />} count={5} label="completed" variant="success" />
 *
 * // Badge with inline label
 * <MetricBadge icon={<Users />} count={12} label="students" variant="info" showLabel />
 */
export const MetricBadge: React.FC<MetricBadgeProps> = ({
  icon,
  count,
  label,
  variant,
  showLabel = false,
  className,
  tooltipDelay = 300,
}) => {
  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1',
        'rounded-md border text-sm font-medium',
        variantStyles[variant],
        showLabel ? 'min-w-[90px]' : 'min-w-[48px]',
        'h-[32px] justify-center',
        'pointer-events-auto',
        className
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-semibold tabular-nums">{count}</span>
      {showLabel && <span className="text-xs whitespace-nowrap">{label}</span>}
    </div>
  );

  // Only wrap in tooltip if label is not shown inline
  if (showLabel) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-slate-900 border-white/20 text-white text-xs"
        >
          {count} {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricBadge;
