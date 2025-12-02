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

// Default time range: 8 AM to 6 PM (10 hours)
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 18;

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

  // Calculate dynamic time range based on schedules
  const { effectiveStartHour, effectiveEndHour, HOURS } = useMemo(() => {
    const activeSchedules = schedules.filter((s) => !s.isObsolete);
    
    if (activeSchedules.length === 0) {
      // No schedules: use default range
      const hours = Array.from(
        { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
        (_, i) => DEFAULT_START_HOUR + i
      );
      return { effectiveStartHour: DEFAULT_START_HOUR, effectiveEndHour: DEFAULT_END_HOUR, HOURS: hours };
    }

    // Find earliest and latest times in schedules
    let earliestHour = 24;
    let latestHour = 0;

    activeSchedules.forEach((slot) => {
      const startTime = parseTime(slot.startTime);
      const endTime = parseTime(slot.endTime);
      
      earliestHour = Math.min(earliestHour, Math.floor(startTime));
      latestHour = Math.max(latestHour, Math.ceil(endTime));
    });

    // If all schedules fall within default range, use default
    if (earliestHour >= DEFAULT_START_HOUR && latestHour <= DEFAULT_END_HOUR) {
      const hours = Array.from(
        { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
        (_, i) => DEFAULT_START_HOUR + i
      );
      return { effectiveStartHour: DEFAULT_START_HOUR, effectiveEndHour: DEFAULT_END_HOUR, HOURS: hours };
    }

    // Expand range with 1-hour padding
    const startHour = Math.max(0, earliestHour - 1);
    const endHour = Math.min(23, latestHour + 1);
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    
    return { effectiveStartHour: startHour, effectiveEndHour: endHour, HOURS: hours };
  }, [schedules]);

  // Get current day for highlighting
  const currentDay = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  // Calculate position and height for a schedule slot
  const getSlotStyle = (slot: ScheduleSlotDto) => {
    const startTime = parseTime(slot.startTime);
    const endTime = parseTime(slot.endTime);
    
    // Calculate top position as percentage
    const topPercent = ((startTime - effectiveStartHour) / (effectiveEndHour - effectiveStartHour + 1)) * 100;
    
    // Calculate height as percentage
    const duration = endTime - startTime;
    const heightPercent = (duration / (effectiveEndHour - effectiveStartHour + 1)) * 100;
    
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
      <div className="grid grid-cols-8 border-b border-white/[0.08]">
        {/* Time column header */}
        <div className="p-2 text-center text-white/40 text-xs font-medium border-r border-white/[0.05]">
          Time
        </div>
        {/* Day headers */}
        {DAYS_OF_WEEK.map((day) => {
          const hasSlots = schedulesByDay[day].length > 0;
          const isToday = day === currentDay;
          return (
            <div
              key={day}
              className={cn(
                'p-2 text-center text-xs font-medium border-r border-white/[0.05] last:border-r-0',
                isToday && 'bg-white/[0.05]',
                hasSlots ? (isToday ? 'text-blue-300' : 'text-white') : 'text-white/40'
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
        <div className="border-r border-white/[0.05] relative">
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
            className="relative border-r border-white/[0.05] last:border-r-0"
          >
            {/* Hour grid lines */}
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                className="absolute w-full border-t border-white/[0.02]"
                style={{ top: `${(idx / HOURS.length) * 100}%` }}
              />
            ))}

            {/* Schedule slots */}
            {schedulesByDay[day].map((slot, idx) => (
              <div
                key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}
                className={cn(
                  'absolute left-1 right-1 rounded-md px-1 py-0.5 overflow-hidden cursor-pointer',
                  'bg-blue-500/60 border border-blue-400/70 shadow-sm shadow-blue-500/20',
                  'hover:bg-blue-500/80',
                  'transition-all duration-200'
                )}
                style={getSlotStyle(slot)}
                onClick={() => onSlotClick?.(slot)}
                title={`${slot.dayOfWeek} ${slot.startTime} - ${slot.endTime}`}
              >
                <div className="text-xs text-white font-semibold truncate">
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
    </div>
  );
};

export default WeeklyScheduleGrid;
