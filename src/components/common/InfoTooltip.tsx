import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

export interface TooltipItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
}

export interface InfoTooltipProps {
  /** The element that triggers the tooltip on hover */
  children: React.ReactNode;
  /** Title displayed at the top of the tooltip with icon */
  title: string;
  /** Icon displayed next to the title */
  titleIcon?: LucideIcon;
  /** Color class for the title (e.g., 'text-emerald-300') */
  titleColor?: string;
  /** List of label-value pairs to display */
  items?: TooltipItem[];
  /** Optional summary line at the bottom */
  summary?: string;
  /** Optional footer note (smaller, dimmed text) */
  footerNote?: string;
  /** Custom content to render instead of items */
  customContent?: React.ReactNode;
  /** Tooltip position */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing tooltip in ms */
  delayDuration?: number;
  /** Additional class names for the tooltip content */
  className?: string;
}

/**
 * Standardized tooltip component for displaying detailed information on hover.
 * Provides consistent styling across the application for hover tooltips.
 * 
 * @example
 * // Basic usage with items
 * <InfoTooltip
 *   title="Attendance Summary"
 *   titleIcon={Calendar}
 *   titleColor="text-blue-300"
 *   items={[
 *     { label: 'Present', value: 10 },
 *     { label: 'Absent', value: 2 },
 *   ]}
 *   summary="85% attendance rate"
 * >
 *   <BadgeComponent />
 * </InfoTooltip>
 * 
 * @example
 * // With custom content
 * <InfoTooltip
 *   title="Discount Active"
 *   titleIcon={Percent}
 *   customContent={<CustomDetailComponent />}
 * >
 *   <TriggerElement />
 * </InfoTooltip>
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({
  children,
  title,
  titleIcon: TitleIcon,
  titleColor = 'text-blue-300',
  items,
  summary,
  footerNote,
  customContent,
  side = 'bottom',
  delayDuration = 200,
  className = '',
}) => {
  const tooltipContent = (
    <div className="space-y-2">
      {/* Title with icon */}
      <div className={`font-semibold ${titleColor} flex items-center gap-1.5`}>
        {TitleIcon && <TitleIcon className="w-3.5 h-3.5" />}
        {title}
      </div>

      {/* Custom content or items */}
      {customContent ? (
        customContent
      ) : items && items.length > 0 ? (
        <div className="text-sm space-y-0.5">
          {items.map((item, index) => (
            <p key={index} className="flex items-center gap-1.5">
              {item.icon && (
                <item.icon className={`w-3 h-3 ${item.iconColor || 'text-white/60'}`} />
              )}
              <span className="text-white/60">{item.label}:</span>{' '}
              <span className="text-white">{item.value}</span>
            </p>
          ))}
        </div>
      ) : null}

      {/* Summary line */}
      {summary && (
        <div className="text-sm text-white/80 pt-1 border-t border-white/10">
          {summary}
        </div>
      )}

      {/* Footer note */}
      {footerNote && (
        <div className="text-xs text-white/40 pt-1 border-t border-white/10">
          {footerNote}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={`bg-gray-900 border-gray-700 max-w-xs ${className}`}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(InfoTooltip);
