import React from 'react';
import { Users, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { PaymentSummary } from '@/types/api/teacher';

interface PaymentSummaryBarProps {
  summary: PaymentSummary;
}

/**
 * Payment summary bar displaying aggregated payment stats across all classes.
 * Shows total students, paid count, students with dues, and outstanding amount.
 */
const PaymentSummaryBar: React.FC<PaymentSummaryBarProps> = ({ summary }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          Total Students:{' '}
          <span className="font-semibold text-white">{summary.totalStudents}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400/80" />
        <span className="text-sm text-white/80">
          Paid:{' '}
          <span className="font-semibold text-green-400">{summary.paidStudents}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400/80" />
        <span className="text-sm text-white/80">
          With Dues:{' '}
          <span className={`font-semibold ${summary.studentsWithDues > 0 ? 'text-amber-400' : 'text-white'}`}>
            {summary.studentsWithDues}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          Outstanding:{' '}
          <span className={`font-semibold ${summary.totalOutstanding > 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(summary.totalOutstanding)}
          </span>
        </span>
      </div>
    </div>
  );
};

export default PaymentSummaryBar;
