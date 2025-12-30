import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { HomeworkOverview } from '@/types/api/student';

interface HomeworkCardProps {
  homework: HomeworkOverview;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({ homework }) => {
  const hasData = homework.totalAssigned > 0;

  // Format the due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Homework – All time</h3>

      {hasData ? (
        <div className="space-y-3">
          {/* Compact metrics layout */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {homework.completedCount}/{homework.totalAssigned} completed
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {homework.missingCount} missing
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                {homework.completionRate.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Next due homework */}
          {homework.nextDueTitle && homework.nextDueDate && (
            <div className="text-xs text-white/40 pt-2 border-t border-white/10">
              <span className="text-white/50">Next due:</span> {homework.nextDueTitle} – {formatDueDate(homework.nextDueDate)}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">
          No homework assigned yet.
        </p>
      )}
    </GlassCard>
  );
};

export default HomeworkCard;
