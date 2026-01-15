/**
 * Salary Total Hero Component
 * Prominent display of the grand total - the most important number
 * Inspired by Stripe/Linear dashboard summary cards
 */
import React from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Amount } from '@/components/ui/amount';
import { formatRelativeTime } from '@/utils/formatters';
import type { SalaryCalculationDetail, SalaryCalculationStatus } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import { EmploymentTypeBadge } from '../../detail-page/tabs/salary-calculations/components/EmploymentTypeBadge';

interface SalaryTotalHeroProps {
  detail: SalaryCalculationDetail;
  currentEmploymentType: 'full_time' | 'contract';
  onApprove: () => void;
  onReopen: () => void;
}

const statusConfig: Record<SalaryCalculationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Approved' },
  reopened: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Reopened' },
};

export const SalaryTotalHero: React.FC<SalaryTotalHeroProps> = ({
  detail,
  currentEmploymentType,
  onApprove,
  onReopen,
}) => {
  const status = statusConfig[detail.status];
  const hasBaseSalary = detail.baseSalaryAmount > 0;
  const hasAdjustments = detail.adjustmentsTotal !== 0;
  const showBreakdown = hasBaseSalary || hasAdjustments;
  const canApprove = detail.status === 'pending' || detail.status === 'reopened';

  return (
    <div className="bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Left: Total Amount */}
        <div className="flex items-center gap-6">
          {/* Grand Total - The Star */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">
              {showBreakdown ? 'Grand Total' : 'Total Amount'}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tabular-nums">
                {detail.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-white/40 text-sm">MKD</span>
            </div>
          </div>

          {/* Breakdown (when base salary or adjustments exist) */}
          {showBreakdown && (
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              {hasBaseSalary && (
                <>
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-0.5">Base Salary</div>
                    <Amount value={detail.baseSalaryAmount} size="sm" className="text-white/70" />
                  </div>
                  <div className="text-white/30">+</div>
                </>
              )}
              <div className="text-center">
                <div className="text-white/40 text-xs mb-0.5">Variable Pay</div>
                <Amount value={detail.calculatedAmount} size="sm" className="text-white/70" />
              </div>
              {hasAdjustments && (
                <>
                  <div className="text-white/30">+</div>
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-0.5">Adjustments</div>
                    <Amount value={detail.adjustmentsTotal} size="sm" showSign colorBySign />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 pl-6 border-l border-white/10 text-xs">
            <Badge className={`${status.bg} ${status.text} border-0 font-medium`}>
              {status.label}
            </Badge>
            <EmploymentTypeBadge
              calculationEmploymentType={detail.employmentType}
              currentEmploymentType={currentEmploymentType}
            />
            <span className="text-white/40">
              Created {formatRelativeTime(detail.createdAt)}
            </span>
            {detail.approvedAt && (
              <span className="text-white/40">
                Approved {formatRelativeTime(detail.approvedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div>
          {canApprove && (
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
    </div>
  );
};
