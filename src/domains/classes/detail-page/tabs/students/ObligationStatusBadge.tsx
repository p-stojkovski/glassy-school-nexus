import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Amount } from '@/components/ui/amount';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import type { FinancialStatusType } from '@/types/api/obligations';

interface ObligationStatusBadgeProps {
  status: FinancialStatusType;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  hasOverdue?: boolean;
  overdueAmount?: number;
  /** Click handler to open obligations sidebar */
  onClick?: () => void;
}

/**
 * Configuration for each financial status type.
 * Colors follow the spec: Emerald (paid), Amber (pending), Violet (partial), Rose (overdue), Slate (none)
 */
const statusConfig: Record<
  FinancialStatusType,
  { label: string; badgeClass: string }
> = {
  paid: {
    label: 'Paid',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  pending: {
    label: 'pending',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  partial: {
    label: 'remaining',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  overdue: {
    label: 'overdue',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  none: {
    label: '-',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
};

/**
 * ObligationStatusBadge - Displays student's financial obligation status with color coding.
 *
 * Status colors:
 * - Paid (emerald): All obligations fully paid
 * - Pending (amber): Has obligations, nothing paid yet
 * - Partial (violet): Some payments made, balance remaining
 * - Overdue (rose): Has past-due obligations
 * - None (slate): No obligations for this student
 *
 * Includes a tooltip with amount breakdown on hover.
 */
export const ObligationStatusBadge: React.FC<ObligationStatusBadgeProps> = ({
  status,
  totalAmount = 0,
  paidAmount = 0,
  remainingAmount = 0,
  hasOverdue = false,
  overdueAmount = 0,
  onClick,
}) => {
  const config = statusConfig[status];

  // Determine badge content
  const getBadgeContent = () => {
    if (status === 'paid' || status === 'none') {
      return config.label;
    }
    // For pending/partial/overdue, show the remaining amount
    return (
      <span className="flex items-center gap-1">
        <Amount value={remainingAmount} size="sm" className="font-semibold" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Build tooltip content with amount breakdown
  const getTooltipContent = () => {
    if (status === 'none') {
      return 'No payment obligations';
    }

    if (status === 'paid') {
      return (
        <div className="space-y-1">
          <div className="text-emerald-300 font-medium">Fully Paid</div>
          <div className="text-white/70 text-xs">
            Total: <Amount value={totalAmount} size="sm" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-white/60">Total:</span>
          <Amount value={totalAmount} size="sm" />
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-white/60">Paid:</span>
          <Amount value={paidAmount} size="sm" className="text-emerald-400" />
        </div>
        <div className="flex justify-between gap-4 text-xs border-t border-white/10 pt-1.5">
          <span className="text-white/60">Remaining:</span>
          <Amount value={remainingAmount} size="sm" className="font-semibold" />
        </div>
        {hasOverdue && overdueAmount > 0 && (
          <div className="flex justify-between gap-4 text-xs text-rose-400">
            <span>Overdue:</span>
            <Amount value={overdueAmount} size="sm" className="text-rose-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'} ${config.badgeClass}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            } : undefined}
          >
            {getBadgeContent()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-[#1a1f2e] border-white/10 px-3 py-2"
        >
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ObligationStatusBadge;
