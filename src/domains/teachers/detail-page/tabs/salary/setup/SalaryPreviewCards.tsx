import { DollarSign, Calculator, Percent, Wallet } from 'lucide-react';
import { SalaryBreakdown } from './useSalaryCalculations';
import { TAX_RATES } from './salarySetupSchema';

interface SalaryPreviewCardsProps {
  breakdown: SalaryBreakdown | null;
}

export default function SalaryPreviewCards({ breakdown }: SalaryPreviewCardsProps) {
  const formatMKD = (amount: number) => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const formatPercent = (rate: number) => {
    return (rate * 100).toFixed(1) + '%';
  };

  // Show placeholder state when no breakdown
  if (!breakdown) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70">Salary Preview</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Gross Salary Placeholder */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/50">Gross Salary</p>
              <DollarSign className="h-4 w-4 text-white/30" />
            </div>
            <p className="text-lg font-bold text-white/30">—</p>
          </div>

          {/* Contributions Placeholder */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/50">Contributions</p>
              <Calculator className="h-4 w-4 text-white/30" />
            </div>
            <p className="text-lg font-bold text-white/30">—</p>
          </div>

          {/* Income Tax Placeholder */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/50">Income Tax</p>
              <Percent className="h-4 w-4 text-white/30" />
            </div>
            <p className="text-lg font-bold text-white/30">—</p>
          </div>

          {/* Net Salary Placeholder */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/50">Net Salary</p>
              <Wallet className="h-4 w-4 text-white/30" />
            </div>
            <p className="text-lg font-bold text-white/30">—</p>
          </div>
        </div>
        <p className="text-xs text-white/40 text-center">
          Enter a salary amount to see the breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-white/70">Salary Preview</h4>
      <div className="grid grid-cols-2 gap-3">
        {/* Gross Salary */}
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/70">Gross Salary</p>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-white">{formatMKD(breakdown.grossSalary)}</p>
          <p className="text-[10px] text-white/50 mt-1">Before deductions</p>
        </div>

        {/* Total Contributions */}
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/70">Contributions</p>
            <Calculator className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-lg font-bold text-orange-400">
            -{formatMKD(breakdown.contributions.total)}
          </p>
          <p className="text-[10px] text-white/50 mt-1">
            {formatPercent(TAX_RATES.PENSION + TAX_RATES.HEALTH + TAX_RATES.EMPLOYMENT + TAX_RATES.INJURY)} of gross
          </p>
        </div>

        {/* Income Tax */}
        <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/70">Income Tax</p>
            <Percent className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-lg font-bold text-red-400">
            -{formatMKD(breakdown.incomeTax)}
          </p>
          <p className="text-[10px] text-white/50 mt-1">
            {formatPercent(TAX_RATES.INCOME_TAX)} on {formatMKD(breakdown.taxableIncome)}
          </p>
        </div>

        {/* Net Salary (highlighted) */}
        <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Net Salary</p>
            <Wallet className="h-4 w-4 text-green-300" />
          </div>
          <p className="text-lg font-bold text-white">{formatMKD(breakdown.netSalary)}</p>
          <p className="text-[10px] text-white/70 mt-1">Take-home amount</p>
        </div>
      </div>

      {/* Contribution Details */}
      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-xs font-medium text-white/60 mb-2">Contribution Breakdown</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between text-white/50">
            <span>Pension ({formatPercent(TAX_RATES.PENSION)})</span>
            <span className="text-white/70">{formatMKD(breakdown.contributions.pension)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Health ({formatPercent(TAX_RATES.HEALTH)})</span>
            <span className="text-white/70">{formatMKD(breakdown.contributions.health)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Employment ({formatPercent(TAX_RATES.EMPLOYMENT)})</span>
            <span className="text-white/70">{formatMKD(breakdown.contributions.employment)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Injury ({formatPercent(TAX_RATES.INJURY)})</span>
            <span className="text-white/70">{formatMKD(breakdown.contributions.injury)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
