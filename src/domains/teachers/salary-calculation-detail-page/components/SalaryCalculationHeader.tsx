/**
 * Salary Calculation Detail Page Header
 * Shows title, status badge, amount, created date, and action buttons
 * Compact layout with summary info inline
 */
import React from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SalaryCalculationDetail, SalaryCalculationStatus } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationHeaderProps {
  detail: SalaryCalculationDetail;
  onApprove: () => void;
  onReopen: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('mk-MK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MKD';
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + ' days ago';
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks + (weeks > 1 ? ' weeks' : ' week') + ' ago';
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months + (months > 1 ? ' months' : ' month') + ' ago';
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusBadge = (status: SalaryCalculationStatus) => {
  const styles = {
    pending: {
      variant: 'secondary' as const,
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      label: 'Pending',
    },
    approved: {
      variant: 'default' as const,
      className: 'bg-green-500/20 text-green-300 border-green-500/30',
      label: 'Approved',
    },
    reopened: {
      variant: 'secondary' as const,
      className: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      label: 'Reopened',
    },
  };

  const style = styles[status];
  return (
    <Badge variant={style.variant} className={style.className}>
      {style.label}
    </Badge>
  );
};

export const SalaryCalculationHeader: React.FC<SalaryCalculationHeaderProps> = ({
  detail,
  onApprove,
  onReopen,
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        {/* Title row with status badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Salary Calculation Details
          </h1>
          {getStatusBadge(detail.status)}
        </div>

        {/* Summary info inline */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-white/60">Amount:</span>
            <span className="text-lg font-semibold text-white">
              {formatCurrency(detail.calculatedAmount)}
            </span>
          </div>

          {detail.approvedAmount !== null && detail.approvedAmount !== detail.calculatedAmount && (
            <div className="flex items-baseline gap-2">
              <span className="text-white/60">Approved:</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(detail.approvedAmount)}
              </span>
              <span
                className={
                  detail.approvedAmount > detail.calculatedAmount
                    ? 'text-xs text-green-400'
                    : 'text-xs text-red-400'
                }
              >
                ({detail.approvedAmount > detail.calculatedAmount ? '+' : ''}
                {formatCurrency(detail.approvedAmount - detail.calculatedAmount)})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-white/60">Created:</span>
            <span className="text-white/80">
              {formatRelativeTime(detail.createdAt)}
            </span>
          </div>

          {detail.approvedAt && (
            <div className="flex items-baseline gap-2">
              <span className="text-white/60">Approved:</span>
              <span className="text-white/80">
                {formatRelativeTime(detail.approvedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {(detail.status === 'pending' || detail.status === 'reopened') && (
          <Button
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        )}

        {detail.status === 'approved' && (
          <Button
            onClick={onReopen}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
};
