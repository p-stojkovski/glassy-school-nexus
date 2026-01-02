import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { LessonsOverview } from '@/types/api/teacher';
import { Calendar, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LessonsCardProps {
  data: LessonsOverview;
  onClick: () => void;
}

const LessonsCard: React.FC<LessonsCardProps> = ({ data, onClick }) => {
  const hasLessons = data.totalLessonsThisMonth > 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return null;
    }
  };

  const lastConducted = formatDate(data.lastConductedDate);
  const nextScheduled = formatDate(data.nextScheduledDate);

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">This Month</h3>
        <Calendar className="w-4 h-4 text-white/40" />
      </div>

      {hasLessons ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">{data.conductedThisMonth}</p>
            <div className="text-right">
              <span className="text-sm text-green-400">conducted</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {data.cancelledThisMonth > 0 && (
              <span className="text-red-400">
                {data.cancelledThisMonth} cancelled
              </span>
            )}
            {data.makeupThisMonth > 0 && (
              <span className="text-yellow-400">
                {data.makeupThisMonth} makeup
              </span>
            )}
          </div>

          {nextScheduled ? (
            <p className="text-xs text-white/50">
              Next: {nextScheduled}
            </p>
          ) : lastConducted ? (
            <p className="text-xs text-white/50">
              Last: {lastConducted}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-white/50">No lessons this month yet</p>
      )}

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View all lessons</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

export default LessonsCard;
