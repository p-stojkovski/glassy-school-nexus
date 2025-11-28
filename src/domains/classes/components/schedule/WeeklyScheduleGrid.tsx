import React, { useMemo } from 'react';
import { ScheduleSlotDto } from '@/types/api/class';
import { cn } from '@/lib/utils';

interface WeeklyScheduleGridProps {
  schedules: ScheduleSlotDto[];
  onSlotClick?: (slot: ScheduleSlotDto) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

// Time slots from 7 AM to 9 PM (common school hours)
const START_HOUR = 7;
const END_HOUR = 21;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  schedules,
  onSlotClick,
}) => {
  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const map: Record<string, ScheduleSlotDto[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = [];
    });
    
    schedules
      .filter((s) => !s.isObsolete)
      .forEach((slot) => {
        if (map[slot.dayOfWeek]) {
          map[slot.dayOfWeek].push(slot);
        }
      });
    
    return map;
  }, [schedules]);

  // Calculate position and height for a schedule slot
  const getSlotStyle = (slot: ScheduleSlotDto) => {
    const startTime = parseTime(slot.startTime);
    const endTime = parseTime(slot.endTime);
    
    // Calculate top position as percentage
    const topPercent = ((startTime - START_HOUR) / (END_HOUR - START_HOUR + 1)) * 100;
    
    // Calculate height as percentage
    const duration = endTime - startTime;
    const heightPercent = (duration / (END_HOUR - START_HOUR + 1)) * 100;
    
    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 4)}%`, // Minimum 4% height for visibility
    };
  };

  // Check if there are any schedules
  const hasSchedules = schedules.some((s) => !s.isObsolete);

  if (!hasSchedules) {
    return null; // Don't render the grid if there are no active schedules
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-8 border-b border-white/10">
        {/* Time column header */}
        <div className="p-2 text-center text-white/40 text-xs font-medium border-r border-white/10">
          Time
        </div>
        {/* Day headers */}
        {DAYS_OF_WEEK.map((day) => {
          const hasSlots = schedulesByDay[day].length > 0;
          return (
            <div
              key={day}
              className={cn(
                'p-2 text-center text-xs font-medium border-r border-white/10 last:border-r-0',
                hasSlots ? 'text-white' : 'text-white/40'
              )}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{DAY_ABBREVIATIONS[day]}</span>
              {hasSlots && (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Grid body with time slots */}
      <div className="grid grid-cols-8 relative" style={{ minHeight: '300px' }}>
        {/* Time labels column */}
        <div className="border-r border-white/10 relative">
          {HOURS.map((hour, idx) => (
            <div
              key={hour}
              className="absolute w-full text-right pr-2 text-xs text-white/40"
              style={{
                top: `${(idx / (HOURS.length)) * 100}%`,
                transform: 'translateY(-50%)',
              }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="relative border-r border-white/10 last:border-r-0"
          >
            {/* Hour grid lines */}
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                className="absolute w-full border-t border-white/5"
                style={{ top: `${(idx / HOURS.length) * 100}%` }}
              />
            ))}

            {/* Schedule slots */}
            {schedulesByDay[day].map((slot, idx) => (
              <div
                key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}
                className={cn(
                  'absolute left-1 right-1 rounded-md px-1 py-0.5 overflow-hidden cursor-pointer',
                  'bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-400/40',
                  'hover:from-blue-500/40 hover:to-blue-600/40 hover:border-blue-400/60',
                  'transition-all duration-200'
                )}
                style={getSlotStyle(slot)}
                onClick={() => onSlotClick?.(slot)}
                title={`${slot.dayOfWeek} ${slot.startTime} - ${slot.endTime}`}
              >
                <div className="text-xs text-white font-medium truncate">
                  {slot.startTime}
                </div>
                <div className="text-xs text-white/60 truncate hidden sm:block">
                  {slot.endTime}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-white/10 flex items-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-400/40" />
          <span>Scheduled Session</span>
        </div>
        <span className="text-white/30">•</span>
        <span>Click a slot to edit</span>
      </div>
    </div>
  );
};

export default WeeklyScheduleGrid;
