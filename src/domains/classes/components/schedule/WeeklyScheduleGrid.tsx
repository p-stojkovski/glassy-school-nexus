import React, { useMemo } from 'react';
import { ScheduleSlotDto } from '@/types/api/class';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, DAY_ABBREVIATIONS } from '@/constants/schedule';

interface WeeklyScheduleGridProps {
  schedules: ScheduleSlotDto[];
  onSlotClick?: (slot: ScheduleSlotDto) => void;
}


// Default time range: 7 AM to 10 PM (15 hours)
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 22;
const HOUR_BLOCK_HEIGHT = 64; // px height per hour block to reduce scrolling
const MIN_SLOT_HEIGHT = 40;
const BAND_HEIGHT = HOUR_BLOCK_HEIGHT * 2;

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

    // Calculate top position in pixels
    const topPosition = (startTime - effectiveStartHour) * HOUR_BLOCK_HEIGHT;

    // Calculate height in pixels
    const duration = endTime - startTime;
    const heightPx = duration * HOUR_BLOCK_HEIGHT;

    return {
      top: `${topPosition}px`,
      height: `${Math.max(heightPx, MIN_SLOT_HEIGHT)}px`,
    };
  };

  // Check if there are any schedules
  const hasSchedules = schedules.some((s) => !s.isObsolete);

  if (!hasSchedules) {
    return null; // Don't render the grid if there are no active schedules
  }

  const gridHeight = HOURS.length * HOUR_BLOCK_HEIGHT;
  const bandBackground = `linear-gradient(180deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) ${HOUR_BLOCK_HEIGHT}px, transparent ${HOUR_BLOCK_HEIGHT}px, transparent ${BAND_HEIGHT}px)`;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="relative">
        {/* Header with day names */}
        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-white/[0.04] sticky top-0 bg-white/[0.04] backdrop-blur z-10">
          {/* Time column header */}
          <div className="px-3 py-2 text-right text-white/50 text-xs font-medium border-r border-white/[0.04]">
            Time
          </div>
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day) => {
            const sessionCount = schedulesByDay[day].length;
            const hasSlots = sessionCount > 0;
            const isToday = day === currentDay;
            return (
              <div
                key={day}
                className={cn(
                  'px-3 py-2 border-r border-white/[0.04] last:border-r-0 text-xs font-semibold flex items-center justify-between gap-2',
                  hasSlots ? 'text-white' : 'text-white/40',
                  isToday && 'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-blue-400 relative'
                )}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{DAY_ABBREVIATIONS[day]}</span>
                {hasSlots && (
                  <span className="text-[10px] font-medium text-white/70 bg-white/10 rounded-full px-2 py-0.5">
                    {sessionCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid body with time slots - scrollable */}
        <div className="max-h-[520px] overflow-y-auto">
          <div
            className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] relative"
            style={{ height: `${gridHeight}px` }}
          >
            {/* Time labels column */}
            <div className="border-r border-white/[0.04] relative">
              {HOURS.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute w-full text-right pr-3 text-[11px] text-white/60 font-semibold"
                  style={{
                    top: `${idx * HOUR_BLOCK_HEIGHT}px`,
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
                className="relative border-r border-white/[0.03] last:border-r-0"
                style={{
                  backgroundImage: bandBackground,
                  backgroundSize: `100% ${BAND_HEIGHT}px`,
                }}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour, idx) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-white/[0.03]"
                    style={{ top: `${idx * HOUR_BLOCK_HEIGHT}px` }}
                  />
                ))}

                {/* Schedule slots */}
                {schedulesByDay[day].map((slot, idx) => (
                  <div
                    key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}
                    className={cn(
                      'absolute left-1.5 right-1.5 rounded-xl px-3 py-2 overflow-hidden cursor-pointer',
                      'bg-blue-500/80 border border-blue-400/60 shadow-lg shadow-blue-900/30',
                      'hover:bg-blue-500 transition-all duration-200'
                    )}
                    style={getSlotStyle(slot)}
                    onClick={() => onSlotClick?.(slot)}
                    title={`${slot.dayOfWeek} ${slot.startTime} - ${slot.endTime}`}
                  >
                    <div className="text-sm text-white font-semibold truncate">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleGrid;
