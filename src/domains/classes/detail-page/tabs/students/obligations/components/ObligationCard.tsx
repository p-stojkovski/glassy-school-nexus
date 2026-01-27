/**
 * ObligationCard - Displays a single student obligation with amount breakdown and actions.
 *
 * Shows:
 * - Description (e.g., "Monthly Tuition - January 2026")
 * - Amount breakdown: Original -> Discount -> Final
 * - Status badge (pending, partial, paid, cancelled)
 * - Due date
 * - "Register Payment" button (if obligation can be paid)
 */

import React from 'react';
import { CreditCard, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Amount } from '@/components/ui/amount';
import { format, parseISO, isPast } from 'date-fns';
import type { StudentObligationResponse, StudentObligationStatus } from '@/types/api/obligations';

export interface ObligationCardProps {
  /** The obligation data from the API */
  obligation: StudentObligationResponse;
  /** Callback when user clicks "Register Payment" */
  onRegisterPayment: () => void;
}

/**
 * Configuration for obligation status badges.
 * Matches the color scheme used in ObligationStatusBadge.
 */
const statusConfig: Record<
  StudentObligationStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  partial: {
    label: 'Partial',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  paid: {
    label: 'Paid',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
};

/**
 * Formats a date string for display.
 */
function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Checks if a due date is past.
 */
function isOverdue(dateStr: string): boolean {
  try {
    return isPast(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function ObligationCard({ obligation, onRegisterPayment }: ObligationCardProps) {
  const config = statusConfig[obligation.status];
  const canPay = obligation.status === 'pending' || obligation.status === 'partial';
  const hasDiscount = obligation.discountAmount > 0;
  const overdue = canPay && isOverdue(obligation.dueDate);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/[0.07] transition-colors">
      {/* Header: Description + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">
            {obligation.description}
          </h4>
          {obligation.className && (
            <p className="text-white/50 text-xs mt-0.5 truncate">
              {obligation.className}
            </p>
          )}
        </div>
        <Badge variant="outline" className={`shrink-0 ${config.badgeClass}`}>
          {config.label}
        </Badge>
      </div>

      {/* Amount Breakdown */}
      <div className="space-y-1.5 mb-3">
        {/* Original Amount (if there's a discount) */}
        {hasDiscount && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Original:</span>
            <Amount
              value={obligation.originalAmount}
              size="sm"
              className="text-white/50 line-through"
            />
          </div>
        )}

        {/* Discount (if any) */}
        {hasDiscount && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Discount:</span>
            <Amount
              value={-obligation.discountAmount}
              size="sm"
              showSign
              className="text-emerald-400"
            />
          </div>
        )}

        {/* Final Amount */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/60">
            {hasDiscount ? 'Final Amount:' : 'Amount:'}
          </span>
          <Amount value={obligation.finalAmount} size="sm" weight="medium" />
        </div>

        {/* Paid Amount (if partial) */}
        {obligation.paidAmount > 0 && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Paid:</span>
            <Amount
              value={obligation.paidAmount}
              size="sm"
              className="text-emerald-400"
            />
          </div>
        )}

        {/* Remaining Amount (if not fully paid) */}
        {canPay && (
          <div className="flex justify-between items-center text-xs border-t border-white/10 pt-1.5">
            <span className="text-white/70 font-medium">Remaining:</span>
            <Amount
              value={obligation.remainingAmount}
              size="sm"
              weight="semibold"
              className={overdue ? 'text-rose-400' : 'text-amber-400'}
            />
          </div>
        )}
      </div>

      {/* Due Date + Overdue Warning */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <Calendar className="w-3.5 h-3.5 text-white/40" />
        <span className={overdue ? 'text-rose-400' : 'text-white/60'}>
          Due: {formatDate(obligation.dueDate)}
        </span>
        {overdue && (
          <span className="flex items-center gap-1 text-rose-400">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        )}
      </div>

      {/* Action Button */}
      {canPay && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRegisterPayment}
          className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Register Payment
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      )}
    </div>
  );
}

export default ObligationCard;
