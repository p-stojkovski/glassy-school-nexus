/**
 * Salary Calculation Summary Card
 * Shows key metrics: status, calculated amount, approved amount, dates
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface SalaryCalculationSummaryProps {
  detail: SalaryCalculationDetail;
}

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
