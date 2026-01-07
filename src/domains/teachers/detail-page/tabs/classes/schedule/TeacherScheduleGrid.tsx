import React, { useMemo } from 'react';
import { TeacherScheduleSlotDto } from '@/types/api/teacher';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, DAY_ABBREVIATIONS, DayOfWeek } from '@/constants/schedule';

interface TeacherScheduleGridProps {
  slots: TeacherScheduleSlotDto[];
  onSlotClick?: (slot: TeacherScheduleSlotDto) => void;
}

// Default time range: 7 AM to 10 PM (15 hours)
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 22;
const HOUR_BLOCK_HEIGHT = 64; // px height per hour block
const MIN_SLOT_HEIGHT = 48; // Increased for class name display
const BAND_HEIGHT = HOUR_BLOCK_HEIGHT * 2;

// Color palette for different classes (deterministic by classId)
const CLASS_COLORS = [
  { bg: 'bg-blue-500/80', border: 'border-blue-400/60', shadow: 'shadow-blue-900/30' },
  { bg: 'bg-emerald-500/80', border: 'border-emerald-400/60', shadow: 'shadow-emerald-900/30' },
  { bg: 'bg-purple-500/80', border: 'border-purple-400/60', shadow: 'shadow-purple-900/30' },
  { bg: 'bg-amber-500/80', border: 'border-amber-400/60', shadow: 'shadow-amber-900/30' },
  { bg: 'bg-rose-500/80', border: 'border-rose-400/60', shadow: 'shadow-rose-900/30' },
  { bg: 'bg-cyan-500/80', border: 'border-cyan-400/60', shadow: 'shadow-cyan-900/30' },
  { bg: 'bg-indigo-500/80', border: 'border-indigo-400/60', shadow: 'shadow-indigo-900/30' },
  { bg: 'bg-orange-500/80', border: 'border-orange-400/60', shadow: 'shadow-orange-900/30' },
];

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

// Get a consistent color for a class based on its ID
const getClassColor = (classId: string, classIds: string[]) => {
  const index = classIds.indexOf(classId);
  return CLASS_COLORS[index % CLASS_COLORS.length];
};

/**
 * Weekly schedule grid for teacher's teaching schedule.
 * Displays schedule slots with class names, color-coded by class.
 * Optionally interactive - slots can be clicked to navigate to class details.
 */
const TeacherScheduleGrid: React.FC<TeacherScheduleGridProps> = ({
  slots,
  onSlotClick,
}) => {

  // Get unique class IDs for consistent coloring
  const uniqueClassIds = useMemo(() => {
    const ids = new Set<string>();
    slots.forEach(slot => ids.add(slot.classId));
    return Array.from(ids).sort(); // Sort for consistent ordering
  }, [slots]);

  // Map dayName to DayOfWeek type (Sunday=0 in backend, but we display Monday-Sunday)
  const dayNameToDayOfWeek = (dayName: string): DayOfWeek | null => {
    if (DAYS_OF_WEEK.includes(dayName as DayOfWeek)) {
      return dayName as DayOfWeek;
    }
    return null;
  };

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const map: Record<DayOfWeek, TeacherScheduleSlotDto[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    slots.forEach((slot) => {
      const day = dayNameToDayOfWeek(slot.dayName);
      if (day) {
        map[day].push(slot);
      }
    });

    return map;
  }, [slots]);

  // Calculate dynamic time range based on schedules
  const { effectiveStartHour, effectiveEndHour, HOURS } = useMemo(() => {
    if (slots.length === 0) {
      const hours = Array.from(
        { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
        (_, i) => DEFAULT_START_HOUR + i
      );
      return { effectiveStartHour: DEFAULT_START_HOUR, effectiveEndHour: DEFAULT_END_HOUR, HOURS: hours };
    }

    // Find earliest and latest times
    let earliestHour = 24;
    let latestHour = 0;

    slots.forEach((slot) => {
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
  }, [slots]);

  // Get current day for highlighting
  const currentDay = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] as DayOfWeek;
  }, []);

  // Calculate position and height for a schedule slot
  const getSlotStyle = (slot: TeacherScheduleSlotDto) => {
    const startTime = parseTime(slot.startTime);
    const endTime = parseTime(slot.endTime);

    const topPosition = (startTime - effectiveStartHour) * HOUR_BLOCK_HEIGHT;
    const duration = endTime - startTime;
    const heightPx = duration * HOUR_BLOCK_HEIGHT;

    return {
      top: `${topPosition}px`,
      height: `${Math.max(heightPx, MIN_SLOT_HEIGHT)}px`,
    };
  };

  if (slots.length === 0) {
    return null;
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
                {schedulesByDay[day].map((slot, idx) => {
                  const colors = getClassColor(slot.classId, uniqueClassIds);
                  return (
                    <div
                      key={`${slot.slotId}-${idx}`}
                      className={cn(
                        'absolute left-1.5 right-1.5 rounded-xl px-3 py-2 overflow-hidden',
                        colors.bg, colors.border, colors.shadow,
                        'border shadow-lg',
                        !slot.isClassActive && 'opacity-60',
                        onSlotClick && 'cursor-pointer hover:ring-2 hover:ring-white/30 transition-all'
                      )}
                      style={getSlotStyle(slot)}
                      title={`${slot.className}\n${slot.startTime} - ${slot.endTime}`}
                      onClick={() => onSlotClick?.(slot)}
                    >
                      {/* Class name - primary display */}
                      <div className="text-sm text-white font-semibold truncate">
                        {slot.className}
                      </div>
                      {/* Time */}
                      <div className="text-[11px] text-white/80 truncate mt-0.5">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {/* Subject badge */}
                      <div className="text-[10px] text-white/70 truncate mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/20 font-medium">
                          {slot.subjectName}
                        </span>
                        {!slot.isClassActive && (
                          <span className="inline-block ml-1 px-1.5 py-0.5 rounded bg-white/10 font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend for class colors */}
      {uniqueClassIds.length > 1 && (
        <div className="border-t border-white/[0.04] px-4 py-3">
          <div className="flex flex-wrap gap-3">
            {uniqueClassIds.map((classId) => {
              const slot = slots.find(s => s.classId === classId);
              const colors = getClassColor(classId, uniqueClassIds);
              if (!slot) return null;
              return (
                <div
                  key={classId}
                  className="flex items-center gap-2 text-xs text-white/80"
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded',
                      colors.bg.replace('/80', '')
                    )}
                  />
                  <span className="truncate max-w-[120px]">{slot.className}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherScheduleGrid;
