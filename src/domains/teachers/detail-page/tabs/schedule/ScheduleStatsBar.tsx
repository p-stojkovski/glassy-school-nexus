import React from 'react';
import { CalendarDays, Clock3, CalendarRange, Users } from 'lucide-react';
import { TeacherScheduleStats } from '@/types/api/teacher';

interface ScheduleStatsBarProps {
  stats: TeacherScheduleStats;
}

/**
 * Statistics bar displaying teacher's weekly schedule summary.
 * Shows total sessions, weekly hours, active days, and number of classes.
 */
const ScheduleStatsBar: React.FC<ScheduleStatsBarProps> = ({ stats }) => {
  const weeklyHoursLabel =
    stats.weeklyHours % 1 === 0
      ? stats.weeklyHours.toString()
      : stats.weeklyHours.toFixed(1);

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          <span className="font-semibold text-white">{stats.totalSlots}</span>{' '}
          {stats.totalSlots === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Clock3 className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          <span className="font-semibold text-white">{weeklyHoursLabel}</span>{' '}
          {stats.weeklyHours === 1 ? 'hour' : 'hours'} per week
        </span>
      </div>

      <div className="flex items-center gap-2">
        <CalendarRange className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          <span className="font-semibold text-white">{stats.activeDays}</span>{' '}
          {stats.activeDays === 1 ? 'day' : 'days'} active
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">
          <span className="font-semibold text-white">{stats.activeClasses}</span>{' '}
          {stats.activeClasses === 1 ? 'class' : 'classes'}
        </span>
      </div>
    </div>
  );
};

export default ScheduleStatsBar;
