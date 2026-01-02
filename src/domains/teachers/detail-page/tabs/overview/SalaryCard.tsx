import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { SalaryOverview } from '@/types/api/teacher';
import { DollarSign, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface SalaryCardProps {
  data: SalaryOverview;
  onClick: () => void;
}

const SalaryCard: React.FC<SalaryCardProps> = ({ data, onClick }) => {
  const hasSalary = data.netTotal > 0 || data.conductedLessonsThisMonth > 0;

  // Calculate percentage change from last month
  const getPercentageChange = () => {
    if (!data.lastMonthNetTotal || data.lastMonthNetTotal === 0) {
      return null;
    }
    const change = ((data.netTotal - data.lastMonthNetTotal) / data.lastMonthNetTotal) * 100;
    return change;
  };

  const percentageChange = getPercentageChange();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white/60">Estimated Salary</h3>
          <p className="text-xs text-white/40">{currentMonth}</p>
        </div>
        <DollarSign className="w-4 h-4 text-white/40" />
      </div>

      {hasSalary ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.netTotal)}
            </p>
          </div>

          <div className="text-xs space-y-1 text-white/50">
            <div className="flex justify-between">
              <span>Lessons ({data.conductedLessonsThisMonth})</span>
              <span>{formatCurrency(data.lessonsTotal)}</span>
            </div>
            {data.totalBonuses > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Bonuses</span>
                <span>+{formatCurrency(data.totalBonuses)}</span>
              </div>
            )}
            {data.totalDeductions > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Deductions</span>
                <span>-{formatCurrency(data.totalDeductions)}</span>
              </div>
            )}
          </div>

          {percentageChange !== null && (
            <div className="flex items-center gap-1 text-xs">
              {percentageChange >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">
                    +{percentageChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">
                    {percentageChange.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-white/40">vs. last month</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">No salary data yet</p>
      )}

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View details</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

export default SalaryCard;
