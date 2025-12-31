import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { ScheduleOverview } from '@/types/api/teacher';
import { Calendar, ChevronRight } from 'lucide-react';

interface ScheduleCardProps {
  data: ScheduleOverview;
  onClick: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ data, onClick }) => {
  const hasSchedule = data.totalScheduleSlots > 0;

  return (
    <GlassCard
      className="p-4 cursor-pointer transition-all hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">Schedule</h3>
        <Calendar className="w-4 h-4 text-white/40" />
      </div>

      {hasSchedule ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">
              {data.weeklyHours.toFixed(1)} <span className="text-sm font-normal">hrs/week</span>
            </p>
            <span className="text-sm text-white/60">
              {data.totalScheduleSlots} slots
            </span>
          </div>
          {data.nextSession && (
            <div className="text-xs text-white/50">
              <p>Next: {data.nextSession.className}</p>
              <p>{data.nextSession.dayOfWeek} {data.nextSession.startTime}</p>
            </div>
          )}
          {data.upcomingSessionsThisWeek > 0 && (
            <p className="text-xs text-blue-400">
              {data.upcomingSessionsThisWeek} sessions this week
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50">No schedule configured</p>
      )}

      <div className="mt-3 flex items-center text-xs text-white/40">
        <span>View schedule</span>
        <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </GlassCard>
  );
};

export default ScheduleCard;
