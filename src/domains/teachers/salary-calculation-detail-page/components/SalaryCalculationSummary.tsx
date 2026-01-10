/**
 * Salary Calculation Summary Card
 * Shows key metrics: status, calculated amount, approved amount, dates
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationSummaryProps {
  detail: SalaryCalculationDetail;
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

export const SalaryCalculationSummary: React.FC<SalaryCalculationSummaryProps> = ({ detail }) => {
  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-white/60 mb-1">Calculated Amount</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(detail.calculatedAmount)}
            </p>
          </div>
          
          {detail.approvedAmount !== null && (
            <div>
              <p className="text-sm text-white/60 mb-1">Approved Amount</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(detail.approvedAmount)}
              </p>
              {detail.approvedAmount !== detail.calculatedAmount && (
                <p
                  className={
                    detail.approvedAmount > detail.calculatedAmount
                      ? 'text-xs text-green-400'
                      : 'text-xs text-red-400'
                  }
                >
                  {detail.approvedAmount > detail.calculatedAmount ? '+' : ''}
                  {formatCurrency(detail.approvedAmount - detail.calculatedAmount)}
                </p>
              )}
            </div>
          )}
          
          <div>
            <p className="text-sm text-white/60 mb-1">Created</p>
            <p className="text-sm text-white/80">
              {formatRelativeTime(detail.createdAt)}
            </p>
          </div>
          
          {detail.approvedAt && (
            <div>
              <p className="text-sm text-white/60 mb-1">Approved</p>
              <p className="text-sm text-white/80">
                {formatRelativeTime(detail.approvedAt)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
