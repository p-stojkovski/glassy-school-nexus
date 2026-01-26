/**
 * Weekly calendar view for teacher lessons
 * Adapted from TeacherScheduleGrid pattern
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import type { CalendarDateRange, CalendarLesson, LessonsByDate } from './calendarTypes';
import {
  getWeekDays,
  formatDayHeader,
  parseTime,
  formatHour,
  formatDateKey,
} from './utils';
import LessonSlot from './LessonSlot';

interface LessonsCalendarWeeklyProps {
  dateRange: CalendarDateRange;
  lessonsByDate: LessonsByDate;
  onLessonClick?: (lesson: CalendarLesson) => void;
}

// Grid constants
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 22;
const HOUR_BLOCK_HEIGHT = 64;
const MIN_SLOT_HEIGHT = 56; // Slightly larger to accommodate status indicator
const BAND_HEIGHT = HOUR_BLOCK_HEIGHT * 2;

/**
 * Weekly lessons calendar grid
 */
const LessonsCalendarWeekly: React.FC<LessonsCalendarWeeklyProps> = ({
  dateRange,
  lessonsByDate,
  onLessonClick,
}) => {
  const today = useMemo(() => new Date(), []);

  // Get days of the week
  const weekDays = useMemo(() => getWeekDays(dateRange), [dateRange]);

  // Get all lessons for the week as a flat array
  const allLessons = useMemo(() => {
    const lessons: CalendarLesson[] = [];
    lessonsByDate.forEach((dayLessons) => {
      lessons.push(...dayLessons);
    });
    return lessons;
  }, [lessonsByDate]);

  // Calculate dynamic time range based on lessons
  const { effectiveStartHour, effectiveEndHour, hours } = useMemo(() => {
    if (allLessons.length === 0) {
      const hourList = Array.from(
        { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
        (_, i) => DEFAULT_START_HOUR + i
      );
      return {
        effectiveStartHour: DEFAULT_START_HOUR,
        effectiveEndHour: DEFAULT_END_HOUR,
        hours: hourList,
      };
    }

    let earliestHour = 24;
    let latestHour = 0;

    allLessons.forEach((lesson) => {
      const startTime = parseTime(lesson.startTime);
      const endTime = parseTime(lesson.endTime);
      earliestHour = Math.min(earliestHour, Math.floor(startTime));
      latestHour = Math.max(latestHour, Math.ceil(endTime));
    });

    // If within default range, use default
    if (earliestHour >= DEFAULT_START_HOUR && latestHour <= DEFAULT_END_HOUR) {
      const hourList = Array.from(
        { length: DEFAULT_END_HOUR - DEFAULT_START_HOUR + 1 },
        (_, i) => DEFAULT_START_HOUR + i
      );
      return {
        effectiveStartHour: DEFAULT_START_HOUR,
        effectiveEndHour: DEFAULT_END_HOUR,
        hours: hourList,
      };
    }

    // Expand with 1-hour padding
    const startHour = Math.max(0, earliestHour - 1);
    const endHour = Math.min(23, latestHour + 1);
    const hourList = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    return { effectiveStartHour: startHour, effectiveEndHour: endHour, hours: hourList };
  }, [allLessons]);

  // Calculate lesson slot style (position and height)
  const getLessonStyle = (lesson: CalendarLesson): React.CSSProperties => {
    const startTime = parseTime(lesson.startTime);
    const endTime = parseTime(lesson.endTime);
    const topPosition = (startTime - effectiveStartHour) * HOUR_BLOCK_HEIGHT;
    const duration = endTime - startTime;
    const heightPx = Math.max(duration * HOUR_BLOCK_HEIGHT, MIN_SLOT_HEIGHT);

    return {
      top: `${topPosition}px`,
      height: `${heightPx}px`,
    };
  };

  const gridHeight = hours.length * HOUR_BLOCK_HEIGHT;
  const bandBackground = `linear-gradient(180deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) ${HOUR_BLOCK_HEIGHT}px, transparent ${HOUR_BLOCK_HEIGHT}px, transparent ${BAND_HEIGHT}px)`;

  // Count lessons per day for header badges
  const lessonCountByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    weekDays.forEach((day) => {
      const key = formatDateKey(day);
      counts[key] = lessonsByDate.get(key)?.length || 0;
    });
    return counts;
  }, [weekDays, lessonsByDate]);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="relative">
        {/* Header with day names and dates */}
        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-white/[0.04] sticky top-0 bg-white/[0.04] backdrop-blur z-10">
          {/* Time column header */}
          <div className="px-3 py-2 text-right text-white/50 text-xs font-medium border-r border-white/[0.04]">
            Time
          </div>

          {/* Day headers */}
          {weekDays.map((day) => {
            const dateKey = formatDateKey(day);
            const lessonCount = lessonCountByDay[dateKey];
            const isToday = isSameDay(day, today);
            const header = formatDayHeader(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  'px-2 py-2 border-r border-white/[0.04] last:border-r-0 text-xs font-semibold',
                  'flex flex-col items-center justify-center gap-0.5',
                  lessonCount > 0 ? 'text-white' : 'text-white/40',
                  isToday && 'relative after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-blue-400'
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline">{header.short}</span>
                  <span className="sm:hidden">{header.short.charAt(0)}</span>
                  <span className={cn(
                    'text-sm',
                    isToday && 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                  )}>
                    {header.dayNum}
                  </span>
                </div>
                {lessonCount > 0 && (
                  <span className="text-[10px] font-medium text-white/70 bg-white/10 rounded-full px-2 py-0.5">
                    {lessonCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid body with time slots */}
        <div className="max-h-[520px] overflow-y-auto">
          <div
            className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] relative"
            style={{ height: `${gridHeight}px` }}
          >
            {/* Time labels column */}
            <div className="border-r border-white/[0.04] relative">
              {hours.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute w-full text-right pr-3 text-[11px] text-white/60 font-semibold"
                  style={{ top: `${idx * HOUR_BLOCK_HEIGHT}px` }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day);
              const dayLessons = lessonsByDate.get(dateKey) || [];

              return (
                <div
                  key={dateKey}
                  className="relative border-r border-white/[0.03] last:border-r-0"
                  style={{
                    backgroundImage: bandBackground,
                    backgroundSize: `100% ${BAND_HEIGHT}px`,
                  }}
                >
                  {/* Hour grid lines */}
                  {hours.map((hour, idx) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-white/[0.03]"
                      style={{ top: `${idx * HOUR_BLOCK_HEIGHT}px` }}
                    />
                  ))}

                  {/* Lesson slots */}
                  {dayLessons.map((lesson, idx) => (
                    <LessonSlot
                      key={`${lesson.id}-${idx}`}
                      lesson={lesson}
                      style={getLessonStyle(lesson)}
                      onClick={onLessonClick ? () => onLessonClick(lesson) : undefined}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {allLessons.length === 0 && (
        <div className="px-4 py-8 text-center text-white/50 text-sm">
          No lessons scheduled for this week
        </div>
      )}
    </div>
  );
};

export default LessonsCalendarWeekly;
