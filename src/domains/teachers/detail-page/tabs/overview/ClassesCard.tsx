import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { ClassesOverview } from '@/types/api/teacher';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassesCardProps {
  data: ClassesOverview;
}

const ClassesCard: React.FC<ClassesCardProps> = ({ data }) => {
  const hasClasses = data.totalClasses > 0;
  const fillRate = data.fillRatePercentage;

  const getFillRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <GlassCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/60">Classes</h3>
        <BookOpen className="w-4 h-4 text-white/40" />
      </div>

      {hasClasses ? (
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-white">{data.totalClasses}</p>
            <span className="text-xs text-green-400">{data.activeClasses} active</span>
            {data.inactiveClasses > 0 && (
              <span className="text-xs text-white/40">{data.inactiveClasses} inactive</span>
            )}
          </div>
          {data.activeClasses > 0 && (
            <div className="text-right">
              <span className="text-xs text-white/50">Capacity </span>
              <span className={cn('text-sm font-semibold', getFillRateColor(fillRate))}>
                {fillRate}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">No classes assigned</p>
      )}
    </GlassCard>
  );
};

export default ClassesCard;
