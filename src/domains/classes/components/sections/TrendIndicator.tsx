import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type TrendDirection = 'improving' | 'declining' | 'stable';

interface TrendIndicatorProps {
  direction: TrendDirection;
  label?: string;
  tooltipText?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

/**
 * Visual trend indicator showing improvement (↑), decline (↓), or stability (→)
 * Used to show student performance trends over time
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  label,
  tooltipText,
  size = 'sm',
  showLabel = false,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const config = {
    improving: {
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30',
      defaultLabel: 'Improving',
      defaultTooltip: 'Performance is improving',
    },
    declining: {
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/30',
      defaultLabel: 'Declining',
      defaultTooltip: 'Performance is declining',
    },
    stable: {
      icon: Minus,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-400/30',
      defaultLabel: 'Stable',
      defaultTooltip: 'Performance is stable',
    },
  };

  const { icon: Icon, color, bgColor, borderColor, defaultLabel, defaultTooltip } = config[direction];

  const content = (
    <div 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${bgColor} ${borderColor} ${color} ${textSize}`}
    >
      <Icon className={iconSize} />
      {showLabel && <span className="font-medium">{label || defaultLabel}</span>}
    </div>
  );

  if (tooltipText || !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 border-gray-700">
            <p className="text-sm">{tooltipText || defaultTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

export default TrendIndicator;
