import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { SalarySummaryResponse } from '@/types/api/teacherSalary';

interface SalarySummaryCardsProps {
  summary: SalarySummaryResponse;
}

export default function SalarySummaryCards({ summary }: SalarySummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Lessons Total */}
      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Lessons</p>
          <DollarSign className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-white">{formatCurrency(summary.lessonsTotal)}</p>
        <p className="text-xs text-white/60 mt-1">
          {summary.totalConductedLessons} lessons conducted
        </p>
      </div>

      {/* Bonuses */}
      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Bonuses</p>
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-green-400">
          +{formatCurrency(summary.totalBonuses)}
        </p>
        <p className="text-xs text-white/60 mt-1">
          {summary.totalBonuses > 0 ? 'Extra earnings' : 'No bonuses'}
        </p>
      </div>

      {/* Deductions */}
      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Deductions</p>
          <TrendingDown className="h-5 w-5 text-red-400" />
        </div>
        <p className="text-3xl font-bold text-red-400">
          -{formatCurrency(summary.totalDeductions)}
        </p>
        <p className="text-xs text-white/60 mt-1">
          {summary.totalDeductions > 0 ? 'Applied deductions' : 'No deductions'}
        </p>
      </div>

      {/* Net Total */}
      <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/90">Net Total</p>
          <Wallet className="h-5 w-5 text-purple-300" />
        </div>
        <p className="text-3xl font-bold text-white">{formatCurrency(summary.netTotal)}</p>
        <p className="text-xs text-white/70 mt-1">
          Final monthly salary
        </p>
      </div>
    </div>
  );
}
