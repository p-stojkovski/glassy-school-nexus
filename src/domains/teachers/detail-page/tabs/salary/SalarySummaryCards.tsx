import { DollarSign, Wallet, Calculator, Percent } from 'lucide-react';
import { formatMKD } from '@/utils/formatters';
import { SalarySummaryResponse } from '@/types/api/teacherSalary';

interface SalarySummaryCardsProps {
  summary: SalarySummaryResponse;
}

export default function SalarySummaryCards({ summary }: SalarySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {/* Gross Salary */}
      <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-white/60">Gross Salary</p>
          <DollarSign className="h-4 w-4 text-blue-400" />
        </div>
        <p className="text-base font-bold text-white">{formatMKD(summary.grossSalary)}</p>
        <p className="text-[10px] text-white/50 mt-0.5">Before deductions</p>
      </div>

      {/* Total Contributions */}
      <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-white/60">Contributions</p>
          <Calculator className="h-4 w-4 text-orange-400" />
        </div>
        <p className="text-base font-bold text-orange-400">
          -{formatMKD(summary.totalContributions)}
        </p>
        <p className="text-[10px] text-white/50 mt-0.5">
          Pension, health, employment
        </p>
      </div>

      {/* Income Tax */}
      <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-white/60">Income Tax</p>
          <Percent className="h-4 w-4 text-red-400" />
        </div>
        <p className="text-base font-bold text-red-400">
          -{formatMKD(summary.incomeTax)}
        </p>
        <p className="text-[10px] text-white/50 mt-0.5">
          On {formatMKD(summary.taxableIncome)} taxable
        </p>
      </div>

      {/* Net Salary */}
      <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-white/80">Net Salary</p>
          <Wallet className="h-4 w-4 text-green-400" />
        </div>
        <p className="text-base font-bold text-white">{formatMKD(summary.netSalary)}</p>
        <p className="text-[10px] text-white/50 mt-0.5">After all deductions</p>
      </div>
    </div>
  );
}
